// src/models/HomeMVV.ts
import mongoose, { Schema, Document, Model } from "mongoose";

export interface IHomeMVV extends Document {
  key: "mvv";
  missionTitle: string;
  missionText: string;
  visionTitle: string;
  visionText: string;
  valuesTitle: string;
  valuesText: string;
  createdAt: Date;
  updatedAt: Date;
}

const HomeMVVSchema = new Schema<IHomeMVV>(
  {
    key: { type: String, required: true, default: "mvv", enum: ["mvv"], unique: true },
    missionTitle: { type: String, default: "Misyonumuz" },
    missionText: { type: String, default: "" },
    visionTitle: { type: String, default: "Vizyonumuz" },
    visionText: { type: String, default: "" },
    valuesTitle: { type: String, default: "Değerlerimiz" },
    valuesText: { type: String, default: "" },
  },
  { timestamps: true }
);

HomeMVVSchema.index({ key: 1 }, { unique: true });

export const HomeMVV = mongoose.models.HomeMVV || mongoose.model<IHomeMVV>('HomeMVV', HomeMVVSchema);
