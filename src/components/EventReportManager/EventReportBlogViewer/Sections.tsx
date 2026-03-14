import { EventReport } from "./types";

interface GallerySectionProps {
  report: EventReport;
  onSelectImage: (image: string) => void;
}

export function GallerySection({ report, onSelectImage }: GallerySectionProps) {
  if (!report.galleryImages || report.galleryImages.length === 0) return null;

  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-semibold text-gray-900">Event Gallery</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {report.galleryImages.map((image, index) => (
          <div
            key={index}
            className="relative aspect-square rounded-lg overflow-hidden cursor-pointer group shadow-md hover:shadow-xl transition-shadow"
            onClick={() => onSelectImage(image)}
          >
            <img
              src={image}
              alt={`Gallery ${index + 1}`}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
            />
          </div>
        ))}
      </div>
    </section>
  );
}
