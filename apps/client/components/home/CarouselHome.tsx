import { courseImg } from "@/lib/config";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import Image from "next/image";

export default function CarouselHome() {
  return (
    <div className="w-full">
      <Carousel
        opts={{
          align: "start",
          loop: true,
        }}
        className="w-full"
      >
        <CarouselContent className="ml-0 -ml-0">
          {courseImg.map((image, index) => (
            <CarouselItem key={index} className="pl-0">
              <div className="relative h-[200px] sm:h-[250px] md:h-[350px] lg:h-[450px] w-full">
                <Image
                  src={image.img}
                  alt={image.title}
                  fill
                  className="object-cover"
                  priority={index === 0}
                  sizes="100vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4 md:p-8">
                  <div className="max-w-md">
                    <h2 className="text-white text-xl md:text-2xl lg:text-3xl font-bold mb-2 drop-shadow-lg">
                      {image.title}
                    </h2>
                    <p className="text-white/90 text-sm md:text-base hidden sm:block">
                      Learn the best skills in 2024. Get started today with our
                      comprehensive courses.
                    </p>
                  </div>
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="left-2 md:left-4 text-white border-white/30 hover:bg-white/10 hover:border-white bg-black/30 hidden sm:flex" />
        <CarouselNext className="right-2 md:right-4 text-white border-white/30 hover:bg-white/10 hover:border-white bg-black/30 hidden sm:flex" />
      </Carousel>
    </div>
  );
}
