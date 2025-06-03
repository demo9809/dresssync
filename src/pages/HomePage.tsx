import { Button } from "@/components/ui/button";

const HomePage = () => {
  return (
    <div className="min-h-screen bg-white">
      <header className="py-6 px-8 border-b">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold">DressSync</h1>
          <nav className="space-x-4">
            <Button variant="link">Home</Button>
          </nav>
        </div>
      </header>

      <main className="container mx-auto py-12 px-4">
        <section className="text-center max-w-3xl mx-auto">
          <h2 className="text-4xl font-bold mb-4">Welcome to DressSync</h2>
          <p className="text-lg text-gray-600 mb-8">
            Professional Apparel Management System - Streamline your clothing business operations
          </p>
        </section>
      </main>

      <footer className="border-t py-8 mt-auto">
        <div className="container mx-auto px-4 text-center text-gray-500">
          <p>&copy; {new Date().getFullYear()} DressSync. All rights reserved.</p>
        </div>
      </footer>
    </div>);

};

export default HomePage;