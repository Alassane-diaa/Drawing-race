import numpy as np
import matplotlib.pyplot as plt
from pathlib import Path

# Load one of the npz files from quickdraw_data folder
npz_path = Path("quickdraw_data") / "apple.npz"

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
def draw_strokes(drawing, ax, title=""):
    """Draw a Quick Draw drawing on a matplotlib axis"""
    # The drawing is an array of shape (num_points, 3) where each row is [dx, dy, flag]
    # These are delta/offset values, so we need to compute cumulative sums
    if isinstance(drawing, np.ndarray) and len(drawing.shape) == 2:
        # Compute absolute coordinates from deltas
        x_coords = np.cumsum(drawing[:, 0], dtype=np.float32)
        y_coords = np.cumsum(drawing[:, 1], dtype=np.float32)
        pen_flags = drawing[:, 2]
        print(pen_flags)
        # Set axis limits based on the actual data
        ax.set_xlim(x_coords.min() - 10, x_coords.max() + 10)
        ax.set_ylim(y_coords.max() + 10, y_coords.min() - 10)
        ax.set_aspect('equal')
        
        # Plot each segment, but only where pen is down (flag=0)
        for i in range(len(x_coords) - 1):
            # Only draw if pen is down at the current point
            if pen_flags[i] == 0:
                ax.plot(x_coords[i:i+2], y_coords[i:i+2], 'k-', linewidth=1.5, solid_capstyle='round')
    
    ax.set_title(title, fontsize=10)
    ax.axis('off')


# Display the first 6 drawings
fig, axes = plt.subplots(2, 3, figsize=(12, 8))
axes = axes.flatten()

for i in range(min(6, len(drawings))):
    draw_strokes(drawings[i], axes[i], f'Drawing {i+1}')

# Hide unused subplots
for i in range(6, len(axes)):
    axes[i].axis('off')

plt.tight_layout()
plt.suptitle(f'Sample Drawings from {npz_path.name}', fontsize=14, y=0.98)
plt.show()

