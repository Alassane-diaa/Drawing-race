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

        self.embedder = nn.Sequential(
            nn.Linear(3, 64),
            nn.ReLU()
        )

        self.gru = nn.GRU(
            64,
            hidden_size= hidden_size,
            num_layers=2,
            batch_first=True,
            dropout=0.2,
            bidirectional=False
        )

        self.fc = nn.Linear(hidden_size, n_outputs)


    def forward(self, seq):
        X = self.embedder(seq)
        X = self.gru(X)
        return self.fc(X)

# print(torchvision.models.list_models())
# print(list(torchvision.models.get_model_weights("resnet50"))) # ResNet50_Weights.IMAGENET1K_V2

weights = torchvision.models.ResNet50_Weights.IMAGENET1K_V2
model = torchvision.models.resnet50(weights=weights)
print(model)