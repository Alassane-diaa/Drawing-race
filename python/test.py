import torch
import torch.nn as nn
import matplotlib.pyplot as plt
import os


t = torch.tensor([
        [
            [0.1, 0.2, 0],
            [0.1, 0.2, 0],
            [0.1, 0.2, 1],
            [0.1, 0.2, 0],
            [0.1, 0.2, 0],
            [0.1, 0.2, 0],
            [0.1, 0.2, 0],
            [0.1, 0.2, 1],
            [0.1, 0.2, 0],
            [0.1, 0.2, 1]
        ]
    ])
ones_indices = torch.where(t[0, :, 2] == 1)[0]

# Get tensors up to each one
t_first = t[:, :ones_indices[0]+1, :]    # 0 to first 1 (indices 0-2)
t_second = t[:, :ones_indices[1]+1, :]   # 0 to second 1 (indices 0-7)
t_full = t[:, :ones_indices[2]+1, :]     # 0 to third 1 (indices 0-9)

print(t_second)