import mongoose, { Schema, model, models, Document } from "mongoose";

export interface ISiteMenu extends Document {
  singleton: string;
  navbar: {
    brand: {
      name: string;
      slogan: string;
      logoLight: string;
      logoDark: string;
    };
    items: any[];
    ctas: any[];
    isActive: boolean;
  };
  footer: {
    isActive: boolean;
    columns: Array<{ title: string; links: any[] }>;
    contact: { email: string; phone: string; address: string };
    socials: Array<{ platform: string; url: string; isActive: boolean }>;
    map: { provider: string; embedUrl: string; zoom: number; isActive: boolean };
    bottomLinks: any[];
  };
  createdAt: Date;
  updatedAt: Date;
}

const LinkSchema = new Schema(
  {
    label: String,
    url: String,
    href: String,
    external: { type: Boolean, default: false },
    children: [Object],
  },
  { _id: false }
);

const SiteMenuSchema = new Schema(
  {
    singleton: { type: String, default: "SITE_MENU" }, // unique: true kaldırıldı
    navbar: {
      brand: {
        name: { type: String, default: "" },
        slogan: { type: String, default: "" },
        logoLight: { type: String, default: "" },
        logoDark: { type: String, default: "" },
      },
      items: [LinkSchema],
      ctas: [LinkSchema],
      isActive: { type: Boolean, default: true },
    },
    footer: {
      isActive: { type: Boolean, default: true },
      columns: [{ title: String, links: [LinkSchema] }],
      contact: { email: String, phone: String, address: String },
      socials: [{ platform: String, url: String, isActive: { type: Boolean, default: true } }],
      map: { provider: String, embedUrl: String, zoom: Number, isActive: { type: Boolean, default: false } },
      bottomLinks: [LinkSchema],
    },
  },
  { timestamps: true }
);

// Sadece schema.index() kullan
SiteMenuSchema.index({ singleton: 1 }, { unique: true });

export const SiteMenu = mongoose.models.SiteMenu || mongoose.model<ISiteMenu>('SiteMenu', SiteMenuSchema);
