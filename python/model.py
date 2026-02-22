import torch
import torch.nn as nn
import torchvision
import torchmetrics
from functools import partial
N_CATS = 345
device = "cuda"



class CNNModel(nn.Module):

    def __init__(self, hidden_size=128, n_outputs = N_CATS, *args, **kwargs):
        super().__init__(*args, **kwargs)

        # seq shape: N, 33, 3
        self.embedder = nn.Sequential(
            nn.Linear(3, 64),
            nn.ReLU()
        )
        # X shape: N, 33, 64
        self.gru = nn.GRU(
            64,
            hidden_size= hidden_size,
            num_layers=2,
            batch_first=True,
            dropout=0.2,
            bidirectional=False
        )
        # h_ns[-1] shape: N, hidden_size
        self.fc = nn.Linear(hidden_size, n_outputs)
        # output shape = N, n_outputs


    def forward(self, seq):
        X = self.embedder(seq)
        output_, h_ns = self.gru(X)
        return self.fc(h_ns[-1])
