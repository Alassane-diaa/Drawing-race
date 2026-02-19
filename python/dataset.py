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
        
        # Build index mapping: global_idx -> (file_path, drawing_idx_in_file, label)
        self.index_map = []
        
        for file_path in self.files:
            label = file_path.stem
            # Only load metadata to get count, not actual data
            data = np.load(file_path, allow_pickle=True, encoding='latin1')
            num_drawings = min(len(data[split]), self.max_per_class)
            
            # Store references, not actual drawings
            for drawing_idx in range(num_drawings):
                self.index_map.append((file_path, drawing_idx, self.label_to_idx[label]))
            
            data.close()  # Close the file
        
        print(f"Dataset initialized with {len(self.index_map)} samples from {len(self.files)} classes")
    
    def __len__(self):
        return len(self.index_map)
    
    def __getitem__(self, idx):
        file_path, drawing_idx, label = self.index_map[idx]
        
        # Lazy load: only load the specific drawing when needed
        data = np.load(file_path, allow_pickle=True, encoding='latin1')
        drawing = data[self.split][drawing_idx]
        data.close()
        
        # Convert drawing to tensor
        return torch.tensor(drawing, dtype=torch.float32), label


if __name__ =="__main__":
    dataset = QuickDrawDataset(split='train', max_per_class=10000)
    dataloader = DataLoader(dataset=dataset, batch_size=32, shuffle=True)
