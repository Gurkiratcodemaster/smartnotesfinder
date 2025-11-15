import Navbar from "./components/Navbar";
import UploadBox from "./components/UploadBox";

export default function HomePage() {
  return (
    <div>
      <Navbar />

      <main className="p-10 text-center">
        <h1 className="text-3xl font-bold mb-3">Welcome to MyApp</h1>
        <p className="text-lg text-gray-600">
          Your awesome Next.js application starts here.
        </p>
      </main>
      <UploadBox />
    </div>
  );
}
