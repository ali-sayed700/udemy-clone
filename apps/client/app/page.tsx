import CarouselDemo from "@/components/home/CarouselHome";
import HomeCourse from "@/components/home/HomeCourse";

const Home = () => {
  return (
    <div className="flex flex-col gap-4 container mx-auto">
      <CarouselDemo />
      <HomeCourse />
    </div>
  );
};

export default Home;
