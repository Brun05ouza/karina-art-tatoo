import type { LinkBioDocument } from "../data/types";

export function PhonePreview({ value }: { value: LinkBioDocument }) {
  return <div className="ksa-phone"><div className="ksa-phone-notch" /><div className="ksa-phone-screen"><img className="ksa-phone-avatar" src={value.avatarUrl} alt="" /><h3>{value.name}</h3><p>{value.bio}</p><small>{value.instagram}</small><div className="ksa-phone-links">{value.buttons.filter((item) => item.active).sort((a, b) => a.order - b.order).map((item) => <span key={item.id}>{item.label}</span>)}</div><div className="ksa-phone-highlights">{value.highlights.filter((item) => item.active).map((item) => <article key={item.id}><strong>{item.title}</strong><small>{item.text}</small></article>)}</div></div></div>;
}
