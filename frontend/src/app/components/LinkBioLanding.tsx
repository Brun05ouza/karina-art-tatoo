import { useReducedMotion } from "motion/react";
import { useFlashItems, useFlashPageContent } from "../flash-content";
import { useLinkBioContent } from "../link-bio-content";
import { isPageVisible } from "../section-visibility";
import { useWhatsappPhone } from "../site-settings";
import { LinkBioView } from "./LinkBioView";

export function LinkBioLanding() {
  const content = useLinkBioContent();
  const phone = useWhatsappPhone();
  const reduceMotion = Boolean(useReducedMotion());
  const flashPage = useFlashPageContent();
  const flashItems = useFlashItems();
  const flashPageVisible = isPageVisible(flashPage);

  const flashes = flashItems
    .filter((item) => item.active && ["disponivel", "disponível"].includes(item.status.toLowerCase()))
    .slice(0, 3)
    .map((item) => ({
      id: item.id,
      title: item.title,
      status: "Disponível",
      imageUrl: item.imageUrl || "",
    }));

  const showFlashSection = flashPageVisible && flashes.length > 0;

  return (
    <LinkBioView
      content={content}
      phone={phone}
      flashes={flashes}
      showFlashSection={showFlashSection}
      reduceMotion={reduceMotion}
    />
  );
}

/** Re-export para quem ainda importa helpers daqui. */
export { LinkBioView } from "./LinkBioView";
