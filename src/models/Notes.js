import mongoose, {Schema} from "mongoose"
const NotesSchema = new Schema({
  user:{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user'
  },
  title:{
    type: String,
    required: true
  },
   description:{
    type: String,
    required: true
  },
   tag:{
    type: String,
    required: true
  },
  date:{
    type: Date,
    default: Date.now 
  }
});
export const notes = mongoose.model('notes', NotesSchema);
