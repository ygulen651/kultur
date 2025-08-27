import mongoose, { Schema } from "mongoose";

const ImageSchema = new Schema({
  url: String,
  publicId: String,
}, { _id: false });

const PdfSchema = new Schema({
  publicId: String,       // uzantısız: sendika/uploads/Belge-Adi
  filename: String,       // Belge-Adi.pdf
  bytes: Number,
}, { _id: false });

const PostSchema = new Schema({
  title: { type: String, required: true },
  slug: { type: String, unique: true, index: true },
  excerpt: String,
  author: String,
  category: { type: String, default: "Genel" },
  tags: [String],
  publishAt: Date,
  featured: { type: Boolean, default: false },

  content: String,

  cover: ImageSchema,
  gallery: [ImageSchema],

  attachmentPdf: PdfSchema,   // tek bir ana PDF
  
  // PDF bilgileri - bilgi-belge gibi
  fileUrl: String,        // Dosya URL'i
  fileName: String,       // Dosya adı
  fileSize: Number,       // Dosya boyutu
  fileType: String,       // Dosya türü (pdf, docx, vb.)
  mimeType: String,       // MIME türü
}, { timestamps: true });

export default mongoose.models.Post || mongoose.model("Post", PostSchema);
