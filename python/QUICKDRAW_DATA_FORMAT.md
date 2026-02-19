# Quick Draw Dataset Format Explanation

## Overview
The Quick Draw dataset contains hand-drawn sketches from various objects. Each `.npz` file (NumPy compressed archive) contains drawing data organized into three categories: `train`, `test`, and `valid`.

## File Structure

### Loading the Data
```python
import numpy as np

# Load with proper encoding for pickle objects
data = np.load("quickdraw_data/apple.npz", allow_pickle=True, encoding='latin1')

# Available keys
print(data.files)  # ['test', 'train', 'valid']
```

## Data Format

### Shape and Structure
- Each key (`train`, `test`, `valid`) contains an array of drawings
- Example: `data['train']` shape is `(70000,)` - an array of 70,000 individual drawings
- Each drawing is a 2D numpy array with shape `(num_points, 3)`

### Coordinate Representation
Each point in a drawing contains **3 values**:

```
[dx, dy, flag]
```

| Column | Name | Meaning |
|--------|------|---------|
| 0 | `dx` | Relative X-coordinate (delta from previous point) |
| 1 | `dy` | Relative Y-coordinate (delta from previous point) |
| 2 | `flag` | Pen state: **0 = pen down (drawing)**, 1 = pen up (lifted, no drawing) |

**Important:** The flag convention is:
- **0** = Pen is DOWN, actively drawing
- **1** = Pen is UP, lifted (stroke break)

### Example
Raw data:
```
[[-17, -18, 0],
 [-19, -14, 0],
 [-32,  -2, 0],
 [-13,   5, 0],
 [-17,  11, 0]]
```

Converting to absolute coordinates:
```python
drawing = data['train'][0]
x_coords = np.cumsum(drawing[:, 0])  # Cumulative sum of dx values
y_coords = np.cumsum(drawing[:, 1])  # Cumulative sum of dy values
pen_flags = drawing[:, 2]            # Pen state: 0=down, 1=up
```

Result for the example:
```
X absolute: [-17, -36, -68, -81, -98]  (cumulative sum of deltas)
Y absolute: [-18, -32, -34, -29, -18]
Flags:      [  0,   0,   0,   0,   0]  (all drawing, no pen lifts yet)
```

## Visualization

To visualize the drawings with each stroke in a different color:

```python
import numpy as np
import matplotlib.pyplot as plt

# Extract drawing
drawing = data['train'][idx]

# Convert to absolute coordinates
x = np.cumsum(drawing[:, 0], dtype=np.float32)
y = np.cumsum(drawing[:, 1], dtype=np.float32)
pen_flags = drawing[:, 2]

# Plot with different colors for each stroke
fig, ax = plt.subplots(figsize=(6, 6))

colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', 
          '#F7DC6F', '#BB8FCE', '#85C1E2', '#F8B88B', '#A3E4CB']
color_idx = 0
stroke_start = None

# Separate strokes by pen-up events (flag=1)
for i in range(len(pen_flags)):
    if pen_flags[i] == 0:  # Pen is down
        if stroke_start is None:
            stroke_start = i
    else:  # Pen is up (flag=1)
        if stroke_start is not None:
            color = colors[color_idx % len(colors)]
            ax.plot(x[stroke_start:i], y[stroke_start:i], color=color, linewidth=2)
            color_idx += 1
            stroke_start = None

# Draw last stroke if exists
if stroke_start is not None:
    color = colors[color_idx % len(colors)]
    ax.plot(x[stroke_start:], y[stroke_start:], color=color, linewidth=2)

ax.set_aspect('equal')
ax.invert_yaxis()  # Quick Draw uses image coordinates
ax.set_title('Quick Draw Sketch with Color-Coded Strokes')
plt.show()
```

## Understanding Strokes

A **stroke** is a continuous sequence of points drawn without lifting the pen. The flag array tells you when the pen is lifted:

- **flag = 0**: Pen is drawing (included in current stroke)
- **flag = 1**: Pen is lifted (marks end of current stroke)

When you encounter `flag = 1`, that's a **breakpoint** - one stroke ends and a new one begins at the next `flag = 0`.

**Example sequence:**
```
Flag: [0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 1]
      └─ Stroke 1 ─┘     └─ 2 ─┘ └─ Stroke 3 ─┘
```

This drawing has **3 strokes** (separated by the 1s).

## Key Properties

| Property | Value |
|----------|-------|
| Canvas size | Typically operates in a ~256×256 pixel space |
| Coordinate range | Varies per drawing, but typically ±100 from center |
| Pen states | 0 (pen-down/drawing) and 1 (pen-up/lifted) |
| Number of points | Varies per drawing (from ~10 to several hundred) |
| Categories | 345+ object classes (apple, car, house, etc.) |

## Dataset Statistics

- **Training set**: 70,000 drawings per class
- **Validation set**: Typically 2,500 drawings per class  
- **Test set**: 2,500 drawings per class
- **Total**: ~75,000 drawings per NPZ file

## File Naming
- `{object}.npz` - Simplified dataset with fewer samples
- `{object}.full.npz` - Full dataset with all available samples

Example:
- `apple.npz` - Smaller apple dataset
- `apple.full.npz` - Complete apple dataset with more drawings
