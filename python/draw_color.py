import numpy as np
import matplotlib.pyplot as plt
from pathlib import Path

# Load one of the npz files from quickdraw_data folder
npz_path = Path("quickdraw_data") / "airplane.npz"

# Load the data (allow_pickle=True for object arrays)
data = np.load(npz_path, allow_pickle=True, encoding='latin1')

# Display available keys in the npz file
print(f"Keys in {npz_path.name}: {list(data.files)}")

# Get the training data (contains drawings as stroke sequences)
key = 'train'
drawings = data[key]

print(f"Shape of '{key}': {drawings.shape}")
print(f"Data type: {drawings.dtype}")





# Function to draw a Quick Draw stroke
def draw_strokes(drawing, ax, title="", print_=False):
    """Draw a Quick Draw drawing on a matplotlib axis with different colors for each stroke"""
    if isinstance(drawing, np.ndarray) and len(drawing.shape) == 2:
        # Compute absolute coordinates from deltas
        x_coords = np.cumsum(drawing[:, 0], dtype=np.float32)
        y_coords = np.cumsum(drawing[:, 1], dtype=np.float32)
        pen_flags = drawing[:, 2]
        if print_:
            L = []
            for i in range(x_coords.shape[0]):
                L.append([pen_flags[i].item(), x_coords[i].item()])
            print(L)
        print()
            
        # Set axis limits based on the actual data
        ax.set_xlim(x_coords.min() - 10, x_coords.max() + 10)
        ax.set_ylim(y_coords.max() + 10, y_coords.min() - 10)
        ax.set_aspect('equal')
        
        # Color palette for strokes
        colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', 
                  '#F7DC6F', '#BB8FCE', '#85C1E2', '#F8B88B', '#A3E4CB',
                  '#FF8B94', '#A8E6CF', '#FFD3B6', '#FFAAA5', '#FF8B94']
        
        # Plot each segment only when pen is down (flag=0), with color based on stroke index
        for i in range(len(x_coords) - 1):
            # Only draw if pen is down at the current point
            if pen_flags[i] == 0:
                stroke_idx = np.sum(pen_flags[:i])  # Count pen-ups up to this point
                color = colors[int(stroke_idx) % len(colors)]
                ax.plot(x_coords[i:i+2], y_coords[i:i+2], 
                       color=color, linewidth=1.5, solid_capstyle='round')
    
    ax.set_title(title, fontsize=10)
    ax.axis('off')


# Display the first 6 drawings
fig, axes = plt.subplots(2, 3, figsize=(12, 8))
axes = axes.flatten()

for i in range(min(6, len(drawings))):
    if i == 1:
        print_ = True
    else:
        print_ = False
    draw_strokes(drawings[i], axes[i], f'Drawing {i+1}',print_)



# Hide unused subplots
for i in range(6, len(axes)):
    
    axes[i].axis('off')

plt.tight_layout()
plt.suptitle(f'Sample Drawings from {npz_path.name}', fontsize=14, y=0.98)
plt.show()

