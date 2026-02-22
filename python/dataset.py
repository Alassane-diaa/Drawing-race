from torch.utils.data import Dataset, DataLoader
import torch
from pathlib import Path
import numpy as np

class QuickDrawDataset(Dataset):
    def __init__(self, quickdraw_folder="quickdraw_data", split='train', max_per_class=10000):
        self.data_folder = Path(quickdraw_folder)
        # Exclude .full.npz files to avoid duplicates
        all_files = self.data_folder.glob("*.npz")
        self.files = sorted([f for f in all_files if not f.stem.endswith('.full')])
        self.split = split
        self.max_per_class = max_per_class
        self.label_to_idx = {f.stem: i for i, f in enumerate(self.files)}
        
        # Load all data at initialization
        self.data = []
        self.labels = []
        
        for file_path in self.files:
            label = file_path.stem
            label_idx = self.label_to_idx[label]
            
            # Load all drawings from this file
            data = np.load(file_path, allow_pickle=True, encoding='latin1')
            drawings = data[split]
            num_drawings = min(len(drawings), self.max_per_class)
            
            # Process each drawing
            for drawing_idx in range(num_drawings):
                drawing = drawings[drawing_idx]
                X = torch.tensor(drawing, dtype=torch.float32)
                
                # Pad or truncate to 50 rows
                if X.shape[0] >= 50:
                    X = X[:50]
                else:
                    padding_needed = 50 - X.shape[0]
                    padding = torch.zeros(padding_needed, 3)
                    X = torch.cat([X, padding], dim=0)
                
                self.data.append(X)
                self.labels.append(label_idx)
            
            data.close()
        
        print(f"Dataset initialized with {len(self.data)} samples from {len(self.files)} classes")
    
    def __len__(self):
        return len(self.data)
    
    def __getitem__(self, idx):
        return self.data[idx], self.labels[idx]


if __name__ =="__main__":
    dataset = QuickDrawDataset(split='train', max_per_class=10000)
    dataloader = DataLoader(dataset=dataset, batch_size=32, shuffle=True)
