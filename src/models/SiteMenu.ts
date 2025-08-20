import { Schema, model, models } from "mongoose";

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
    singleton: { type: String, default: "SITE_MENU", unique: true, index: true },
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

const SiteMenu = models.SiteMenu || model("SiteMenu", SiteMenuSchema);
export default SiteMenu;
