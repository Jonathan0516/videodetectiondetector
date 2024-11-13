export class Face_Frame {
    constructor(json_data, video_height, video_width) {
      this.time_offset = this.nullable_time_offset_to_seconds(json_data.time_offset);
  
      this.box = {
        x: (json_data.normalized_bounding_box.left || 0) * video_width,
        y: (json_data.normalized_bounding_box.top || 0) * video_height,
        width: ((json_data.normalized_bounding_box.right || 0) - (json_data.normalized_bounding_box.left || 0)) * video_width,
        height: ((json_data.normalized_bounding_box.bottom || 0) - (json_data.normalized_bounding_box.top || 0)) * video_height,
      };
    }
  
    nullable_time_offset_to_seconds(time_offset) {
      if (!time_offset) return 0;
      return time_offset.seconds + (time_offset.nanos || 0) / 1e9;
    }
  }
  
  export class Face_Track {
    constructor(json_data, video_height, video_width) {
      const track = json_data.tracks[0];
      this.start_time = this.nullable_time_offset_to_seconds(track.segment.start_time_offset);
      this.end_time = this.nullable_time_offset_to_seconds(track.segment.end_time_offset);
      this.confidence = track.confidence;
      this.thumbnail = json_data.thumbnail;
      this.attributes = {};
  
      if (track.attributes) {
        track.attributes.forEach(attribute => {
          this.attributes[attribute.name] = attribute.confidence;
        });
      }
  
      this.frames = [];
      track.timestamped_objects.forEach(frame => {
        const new_frame = new Face_Frame(frame, video_height, video_width);
        this.frames.push(new_frame);
      });
    }
  
    nullable_time_offset_to_seconds(time_offset) {
      if (!time_offset) return 0;
      return time_offset.seconds + (time_offset.nanos || 0) / 1e9;
    }
  
    has_frames_for_time(seconds) {
      return this.start_time <= seconds && this.end_time >= seconds;
    }
  
    most_recent_real_bounding_box(seconds) {
      for (let index = 0; index < this.frames.length; index++) {
        if (this.frames[index].time_offset > seconds) {
          if (index > 0) return this.frames[index - 1].box;
          else return null;
        }
      }
      return null;
    }
  
    most_recent_interpolated_bounding_box(seconds) {
      for (let index = 0; index < this.frames.length; index++) {
        if (this.frames[index].time_offset > seconds) {
          if (index > 0) {
            if (index === 1 || index === this.frames.length - 1) return this.frames[index - 1].box;
  
            const start_box = this.frames[index - 1];
            const end_box = this.frames[index];
            const time_delt_ratio = (seconds - start_box.time_offset) / (end_box.time_offset - start_box.time_offset);
  
            return {
              x: start_box.box.x + (end_box.box.x - start_box.box.x) * time_delt_ratio,
              y: start_box.box.y + (end_box.box.y - start_box.box.y) * time_delt_ratio,
              width: start_box.box.width + (end_box.box.width - start_box.box.width) * time_delt_ratio,
              height: start_box.box.height + (end_box.box.height - start_box.box.height) * time_delt_ratio,
            };
          } else return null;
        }
      }
      return null;
    }
  
    current_bounding_box(seconds, interpolate = true) {
      if (interpolate) return this.most_recent_interpolated_bounding_box(seconds);
      else return this.most_recent_real_bounding_box(seconds);
    }
  }
  