export class Text_Frame {
  constructor(json_data, video_height, video_width) {
    this.time_offset = this.nullable_time_offset_to_seconds(json_data.time_offset);

    this.poly = json_data.rotated_bounding_box.vertices.map(vertex => ({
      x: vertex.x * video_width,
      y: vertex.y * video_height
    }));
  }

  nullable_time_offset_to_seconds(time_offset) {
    if (!time_offset) return 0;
    return time_offset.seconds + (time_offset.nanos || 0) / 1e9;
  }

  toString() {
    return this.poly.map(point => `${point.x},${point.y}`).join(',');
  }
}

export class Text_Segment {
  constructor(json_data, video_height, video_width) {
    this.start_time = this.nullable_time_offset_to_seconds(json_data.segment.start_time_offset);
    this.end_time = this.nullable_time_offset_to_seconds(json_data.segment.end_time_offset);
    this.confidence = json_data.confidence;

    this.frames = json_data.frames.map(frame => new Text_Frame(frame, video_height, video_width));
  }

  nullable_time_offset_to_seconds(time_offset) {
    if (!time_offset) return 0;
    return time_offset.seconds + (time_offset.nanos || 0) / 1e9;
  }

  has_frames_for_time(seconds) {
    return this.start_time <= seconds && this.end_time >= seconds;
  }

  most_recent_real_poly(seconds) {
    for (let index = 0; index < this.frames.length; index++) {
      if (this.frames[index].time_offset > seconds) {
        return index > 0 ? this.frames[index - 1].poly : null;
      }
    }
    return null;
  }

  most_recent_interpolated_poly(seconds) {
    for (let index = 0; index < this.frames.length; index++) {
      if (this.frames[index].time_offset > seconds) {
        if (index > 0) {
          if (index === 1 || index === this.frames.length - 1) return this.frames[index - 1].poly;

          const start_poly = this.frames[index - 1];
          const end_poly = this.frames[index];
          const time_delt_ratio = (seconds - start_poly.time_offset) / (end_poly.time_offset - start_poly.time_offset);

          return start_poly.poly.map((point, i) => ({
            x: point.x + (end_poly.poly[i].x - point.x) * time_delt_ratio,
            y: point.y + (end_poly.poly[i].y - point.y) * time_delt_ratio
          }));
        } else return null;
      }
    }
    return null;
  }

  current_bounding_box(seconds, interpolate = true) {
    return interpolate ? this.most_recent_interpolated_poly(seconds) : this.most_recent_real_poly(seconds);
  }
}

export class Text_Detection {
  constructor(json_data, video_height, video_width, confidence_threshold) {
    this.text = json_data.text;
    this.segments = json_data.segments
      .map(segment => new Text_Segment(segment, video_height, video_width))
      .filter(segment => segment.confidence > confidence_threshold);

    if (this.segments.length) {
      this.start_time = this.segments[0].start_time;
      this.end_time = this.segments[this.segments.length - 1].end_time;
      this.start_poly = this.segments[0].frames[0];
      this.id = `${this.start_time},${this.end_time},${this.start_poly}`;
    }
  }

  has_frames_for_time(seconds) {
    return this.segments.some(segment => segment.has_frames_for_time(seconds));
  }

  current_bounding_box(seconds, interpolate = false) {
    const segment = this.segments.find(segment => segment.has_frames_for_time(seconds));
    return segment ? segment.current_bounding_box(seconds, interpolate) : null;
  }
}
