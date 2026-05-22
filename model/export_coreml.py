import json
from pathlib import Path

import torch
import torch.nn as nn
import torch.nn.functional as F
import coremltools as ct


BASE_DIR = Path(__file__).resolve().parent

PT_PATH = BASE_DIR / "tiny_tcn.pt"
META_PATH = BASE_DIR / "meta.json"
OUT_PATH = BASE_DIR / "TinyTCN_AF.mlpackage"


class TCNBlock(nn.Module):
    def __init__(self, c_in, c_out, k=3, dilation=1, dropout=0.1):
        super().__init__()

        pad = (k - 1) * dilation // 2

        self.conv1 = nn.Conv1d(
            c_in,
            c_out,
            kernel_size=k,
            padding=pad,
            dilation=dilation,
        )
        self.bn1 = nn.BatchNorm1d(c_out)

        self.conv2 = nn.Conv1d(
            c_out,
            c_out,
            kernel_size=k,
            padding=pad,
            dilation=dilation,
        )
        self.bn2 = nn.BatchNorm1d(c_out)

        self.drop = nn.Dropout(dropout)

        self.res = (
            nn.Conv1d(c_in, c_out, kernel_size=1)
            if c_in != c_out
            else nn.Identity()
        )

    def forward(self, x):
        r = self.res(x)

        x = F.relu(self.bn1(self.conv1(x)))
        x = self.drop(x)

        x = self.bn2(self.conv2(x))
        x = self.drop(x)

        return F.relu(x + r)


class TinyTCN(nn.Module):
    def __init__(self, in_ch=2, base_ch=32, dropout=0.1):
        super().__init__()

        self.stem = nn.Sequential(
            nn.Conv1d(
                in_ch,
                base_ch,
                kernel_size=7,
                stride=1,
                padding=3,
            ),
            nn.BatchNorm1d(base_ch),
            nn.ReLU(),
        )

        dilations = [1, 2, 4, 8, 16, 32]

        blocks = []
        c = base_ch

        for d in dilations:
            blocks.append(
                TCNBlock(
                    c,
                    c,
                    k=3,
                    dilation=d,
                    dropout=dropout,
                )
            )

        self.tcn = nn.Sequential(*blocks)

        self.pool = nn.AdaptiveAvgPool1d(1)
        self.head = nn.Linear(base_ch, 1)

    def forward(self, x):
        # x shape: (B, 2, 1500)
        z = self.stem(x)
        z = self.tcn(z)
        z = self.pool(z).squeeze(-1)
        logit = self.head(z).squeeze(-1)

        return logit


def load_meta():
    if not META_PATH.exists():
        print("Không tìm thấy meta.json, dùng tham số mặc định")
        return {}

    with open(META_PATH, "r", encoding="utf-8") as f:
        return json.load(f)


def extract_state_dict(ckpt):
    if isinstance(ckpt, dict):
        if "model_state_dict" in ckpt:
            return ckpt["model_state_dict"]

        if "state_dict" in ckpt:
            return ckpt["state_dict"]

    return ckpt


def main():
    print("Loading meta:", META_PATH)
    meta = load_meta()

    base_ch = int(meta.get("base_ch", 32))
    dropout = float(meta.get("dropout", 0.1))

    print("Model params:")
    print("base_ch:", base_ch)
    print("dropout:", dropout)
    print("stem kernel_size:", 7)
    print("tcn kernel_size:", 3)
    print("dilations:", [1, 2, 4, 8, 16, 32])

    model = TinyTCN(
        in_ch=2,
        base_ch=base_ch,
        dropout=dropout,
    )

    print("Loading pt:", PT_PATH)
    ckpt = torch.load(PT_PATH, map_location="cpu")
    state_dict = extract_state_dict(ckpt)

    print("Loading state_dict into model...")
    model.load_state_dict(state_dict, strict=True)

    model.eval()

    example_input = torch.randn(1, 2, 1500)

    print("Tracing model...")
    traced_model = torch.jit.trace(model, example_input)

    print("Converting to CoreML...")
    mlmodel = ct.convert(
        traced_model,
        convert_to="mlprogram",
        inputs=[
            ct.TensorType(
                name="input",
                shape=example_input.shape,
            )
        ],
        outputs=[
            ct.TensorType(name="logit")
        ],
        minimum_deployment_target=ct.target.iOS15,
    )

    print("Saving:", OUT_PATH)
    mlmodel.save(str(OUT_PATH))

    print("Done.")
    print("Saved CoreML model:", OUT_PATH)


if __name__ == "__main__":
    main()
