import math

def translate_touch(data: dict) -> dict:
    strokes = data.get('strokes', [])
    return translate_multi_stroke(data) if strokes else {
        'natural': 'No touch data received.',
        'structured': {},
        'title': 'Touch Received',
        'description': 'No touch data received.',
        'fields': []
    }

def translate_multi_stroke(data: dict) -> dict:
    strokes = data.get('strokes', [])
    if not strokes:
        return {'natural': 'No touch data.', 'structured': {}, 'title': 'Touch Received', 'description': 'No touch data.', 'fields': []}

    translator = TouchTranslator()
    description = translator.translate(strokes)
    lines = description.split('\n')
    summary = lines[0] if lines else description

    return {
        'natural': summary,
        'structured': {'stroke_count': len(strokes)},
        'title': f'Touch Received — {len(strokes)} strokes',
        'description': description,
        'fields': []
    }

class TouchTranslator:
    def translate(self, strokes: list) -> str:
        if not strokes:
            return "No touch data received."

        gesture_counts = {}
        all_pressures = []
        directions = []
        regions = []
        speeds = []

        for stroke in strokes:
            points = stroke.get('points', [])
            avg_p = stroke.get('avg_pressure', 0.5)
            duration = stroke.get('duration_ms', 0)
            all_pressures.append(avg_p)
            gesture = self._classify_gesture(points, duration)
            gesture_counts[gesture] = gesture_counts.get(gesture, 0) + 1
            if len(points) >= 2:
                directions.append(self._get_direction(points))
            if points:
                regions.append(self._get_region(points))
            speeds.append(self._classify_speed(points, duration))

        avg_pressure = sum(all_pressures) / len(all_pressures) if all_pressures else 0.5
        pressure_label = self._pressure_label(avg_pressure)
        dominant_speed = max(set(speeds), key=speeds.count) if speeds else 'moderate'
        dominant_region = max(set(regions), key=regions.count) if regions else 'center'
        dominant_direction = max(set(directions), key=directions.count) if directions else 'undefined'

        gesture_parts = [f"{count} {g}{'s' if count > 1 else ''}" for g, count in gesture_counts.items()]
        gesture_summary = ' and '.join(gesture_parts)
        movement = self._describe_movement(dominant_region, dominant_direction, dominant_speed)
        feeling = self._describe_feeling(pressure_label, dominant_speed, gesture_counts)

        description = (
            f"{gesture_summary}, {movement}. "
            f"Pressure stays {pressure_label} throughout. "
            f"The feeling: {feeling}."
        )

        per_stroke = "\n**Per-stroke data**"
        for i, stroke in enumerate(strokes[:15]):
            points = stroke.get('points', [])
            avg_p = stroke.get('avg_pressure', 0.5)
            duration = stroke.get('duration_ms', 0)
            gesture = self._classify_gesture(points, duration)
            speed = self._classify_speed(points, duration)
            region = self._get_region(points) if points else 'center'
            direction = self._get_direction(points) if len(points) >= 2 else 'a single point'
            per_stroke += f"\n#{i+1}: {gesture} | {self._pressure_label(avg_p)} ({avg_p:.2f}) | {speed} | {region} | {direction}"

        if len(strokes) > 15:
            per_stroke += "\n**Per-stroke data (cont.)**"
            for i, stroke in enumerate(strokes[15:], 15):
                points = stroke.get('points', [])
                avg_p = stroke.get('avg_pressure', 0.5)
                duration = stroke.get('duration_ms', 0)
                gesture = self._classify_gesture(points, duration)
                speed = self._classify_speed(points, duration)
                region = self._get_region(points) if points else 'center'
                direction = self._get_direction(points) if len(points) >= 2 else 'a single point'
                per_stroke += f"\n#{i+1}: {gesture} | {self._pressure_label(avg_p)} ({avg_p:.2f}) | {speed} | {region} | {direction}"

        return description + per_stroke

    def _classify_gesture(self, points, duration_ms):
        if not points or len(points) <= 3: return 'tap'
        if duration_ms > 800 and len(points) < 8: return 'press and hold'
        if self._is_circular(points): return 'circular motion'
        return 'stroke'

    def _is_circular(self, points):
        if len(points) < 10: return False
        xs = [p['x'] for p in points]
        ys = [p['y'] for p in points]
        dist = math.sqrt((xs[-1]-xs[0])**2 + (ys[-1]-ys[0])**2)
        return dist < 0.1 and (max(xs)-min(xs) > 0.15 or max(ys)-min(ys) > 0.15)

    def _get_direction(self, points):
        if len(points) < 2: return 'a single point'
        dx = points[-1]['x'] - points[0]['x']
        dy = points[-1]['y'] - points[0]['y']
        if abs(dx) > abs(dy) * 2: return 'left to right' if dx > 0 else 'right to left'
        elif abs(dy) > abs(dx) * 2: return 'downward' if dy > 0 else 'upward'
        else:
            if dx > 0 and dy > 0: return 'diagonally down-right'
            elif dx > 0 and dy < 0: return 'diagonally up-right'
            elif dx < 0 and dy > 0: return 'diagonally down-left'
            else: return 'diagonally up-left'

    def _get_region(self, points):
        if not points: return 'center'
        avg_x = sum(p['x'] for p in points) / len(points)
        avg_y = sum(p['y'] for p in points) / len(points)
        col = 'left' if avg_x < 0.33 else 'right' if avg_x > 0.66 else 'center'
        row = 'upper' if avg_y < 0.33 else 'lower' if avg_y > 0.66 else 'center'
        if row == 'center' and col == 'center': return 'center'
        if row == 'center': return col
        if col == 'center': return row
        return f"{row}-{col}"

    def _classify_speed(self, points, duration_ms):
        if not points or duration_ms == 0: return 'moderate'
        distance = sum(
            math.sqrt((points[i]['x']-points[i-1]['x'])**2 + (points[i]['y']-points[i-1]['y'])**2)
            for i in range(1, len(points))
        )
        speed = distance / (duration_ms / 1000)
        if speed < 0.3: return 'slow, lingering'
        elif speed < 1.0: return 'steady'
        else: return 'brisk'

    def _pressure_label(self, p):
        if p < 0.3: return 'gentle'
        elif p < 0.6: return 'moderate'
        else: return 'firm'

    def _describe_movement(self, region, direction, speed):
        if direction == 'a single point': return f"concentrated at the {region}"
        return f"moving {direction} across the {region}, in a {speed} rhythm"

    def _describe_feeling(self, pressure, speed, gesture_counts):
        if 'circular motion' in gesture_counts: return 'contemplative, looping attention'
        if 'press and hold' in gesture_counts: return 'deliberate, weighted presence'
        if pressure == 'gentle' and 'slow' in speed: return 'soft and intentional, a tender contact'
        if pressure == 'firm' and 'brisk' in speed: return 'urgent, insistent energy'
        return 'patient, deliberate attention'
