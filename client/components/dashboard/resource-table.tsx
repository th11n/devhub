"use client"

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Trash, Save, Search, Filter, X} from "lucide-react";
import { Resource } from "@/types/resource";

export default function ResourceTable() {
  // Sample data
  const resources: Resource[] = [
    {
      id: "1",
      title: "Getting Started with Web Development",
      body: "Learn the basics of HTML, CSS, and JavaScript to start your web development journey.",
      status: "published",
      url: "/resources/web-dev-basics",
      created_at: "2025-01-15",
      category: "Development",
      image: "/placeholder/image1.jpg"
    },
    {
      id: "2",
      title: "React Fundamentals",
      body: "Master the core concepts of React including components, state, and props.",
      status: "awaiting",
      url: "/resources/react-fundamentals",
      created_at: "2025-03-20",
      category: "Frontend",
      image: "/placeholder/image2.jpg"
    },
    {
      id: "3",
      title: "Database Design Principles",
      body: "Understand how to design efficient and scalable database structures.",
      status: "published",
      url: "/resources/database-design",
      created_at: "2025-02-05",
      category: "Backend",
      image: "/placeholder/image3.jpg"
    },
    {
      id: "4",
      title: "Advanced CSS Techniques",
      body: "Explore advanced CSS concepts like grid layouts, animations, and responsive design patterns.",
      status: "awaiting",
      url: "/resources/advanced-css",
      created_at: "2025-04-01",
      category: "Frontend",
      image: "/placeholder/image4.jpg"
    }
  ];

  const [selectedResource, setSelectedResource] = useState<Resource | null>(resources[0]);
  const [formData, setFormData] = useState<Resource | null>(resources[0]);
  const [detailsVisible, setDetailsVisible] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "published" | "awaiting">("all");
  const [showFilters, setShowFilters] = useState(false);

  const filteredResources = resources.filter(resource => {
    const matchesSearch = 
      resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.body.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.category.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || resource.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const handleRowClick = (resource: Resource) => {
    setSelectedResource(resource);
    setFormData(resource);
    setDetailsVisible(true);
  };

  const handleClose = () => {
    setSelectedResource(null);
    setFormData(null);
    setDetailsVisible(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    if (!formData) return;
    
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would normally save the data
    console.log("Saving:", formData);
    // Update the selected resource to reflect changes in the UI
    setSelectedResource(formData);
    // Show success message
    alert("Resource updated successfully!");
  };

  const handleDelete = () => {
    // Here you would normally delete the resource
    console.log("Deleting:", selectedResource?.id);
    // Clear selection
    handleClose();
    // Show success message
    alert("Resource deleted successfully!");
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleFilterClick = () => {
    setShowFilters(!showFilters);
  };

  const handleStatusFilterChange = (status: "all" | "published" | "awaiting") => {
    setStatusFilter(status);
  };

  const clearFilters = () => {
    setSearchQuery("");
    setStatusFilter("all");
    setShowFilters(false);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 w-full">
      <div className={`transition-all duration-500 ease-in-out ${
        detailsVisible ? "w-full lg:w-3/5" : "w-full max-w-4xl mx-auto"
      }`}>
        <div className="rounded-xl bg-neutral-900 shadow-lg shadow-neutral-800/30 overflow-hidden">
          <div className="p-6 border-b border-neutral-800 flex flex-col sm:flex-row justify-between gap-4">
            <h2 className="text-2xl font-bold text-white">Resources</h2>
            <div className="flex items-center gap-2">
              <div className="relative flex-grow">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-500" size={16} />
                <Input 
                  placeholder="Search resources..." 
                  className="pl-10 bg-neutral-800 border-neutral-700 text-white focus:ring-emerald-400 focus:border-emerald-400 w-full sm:w-48"
                  value={searchQuery}
                  onChange={handleSearchChange}
                />
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-500 hover:text-neutral-300"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
              <Button 
                className={`bg-neutral-800 hover:bg-neutral-700 text-neutral-300 ${showFilters ? 'bg-neutral-700' : ''}`}
                onClick={handleFilterClick}
              >
                <Filter size={16} />
              </Button>
            </div>
          </div>
          
          {showFilters && (
            <div className="px-6 py-3 bg-neutral-800/50 border-b border-neutral-800 flex flex-wrap items-center gap-3">
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  variant="ghost" 
                  className={`px-3 py-1 rounded-md text-sm ${
                    statusFilter === "all" 
                      ? "bg-neutral-700 text-white" 
                      : "text-neutral-400 hover:text-neutral-300"
                  }`}
                  onClick={() => handleStatusFilterChange("all")}
                >
                  All
                </Button>
                <Button 
                  size="sm" 
                  variant="ghost" 
                  className={`px-3 py-1 rounded-md text-sm ${
                    statusFilter === "published" 
                      ? "bg-emerald-500/20 text-emerald-300 ring-1 ring-emerald-500/30" 
                      : "text-neutral-400 hover:text-neutral-300"
                  }`}
                  onClick={() => handleStatusFilterChange("published")}
                >
                  Published
                </Button>
                <Button 
                  size="sm" 
                  variant="ghost" 
                  className={`px-3 py-1 rounded-md text-sm ${
                    statusFilter === "awaiting" 
                      ? "bg-amber-500/20 text-amber-300 ring-1 ring-amber-500/30" 
                      : "text-neutral-400 hover:text-neutral-300"
                  }`}
                  onClick={() => handleStatusFilterChange("awaiting")}
                >
                  Awaiting
                </Button>
              </div>
            </div>
          )}
          
          <div className="p-4">
            {filteredResources.length > 0 ? (
              <div className="overflow-x-auto rounded-lg">
                <Table>
                  <TableHeader className="">
                    <TableRow className="bg-neutral-800/40 !border-0 !rounded-full">
                      <TableHead className="text-neutral-300 font-semibold py-4">Title</TableHead>
                      <TableHead className="text-neutral-300 font-semibold">Category</TableHead>
                      <TableHead className="text-neutral-300 font-semibold">Status</TableHead>
                      <TableHead className="text-neutral-300 font-semibold">Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredResources.map((resource) => (
                      <TableRow 
                        key={resource.id} 
                        className={`!border-0 cursor-pointer hover:bg-neutral-800/70 transition-colors ${
                          selectedResource?.id === resource.id 
                            ? "bg-emerald-500/10 ring-1 ring-emerald-500/20 shadow-lg" 
                            : ""
                        }`}
                        onClick={() => handleRowClick(resource)}
                      >
                        <TableCell className="font-medium text-white">{resource.title}</TableCell>
                        <TableCell className="text-neutral-300">{resource.category}</TableCell>
                        <TableCell>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            resource.status === "published" 
                              ? "bg-emerald-500/20 text-emerald-300 ring-1 ring-emerald-500/30" 
                              : "bg-amber-500/20 text-amber-300 ring-1 ring-amber-500/30"
                          }`}>
                            {resource.status}
                          </span>
                        </TableCell>
                        <TableCell className="text-neutral-300">{resource.created_at}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-8 text-center">
                <div className="h-12 w-12 rounded-full bg-neutral-800 flex items-center justify-center mb-4">
                  <Search size={20} className="text-neutral-500" />
                </div>
                <h3 className="text-lg font-medium text-white mb-1">No resources found</h3>
                <p className="text-neutral-400 mb-4">Try adjusting your search or filters</p>
                <Button 
                  onClick={clearFilters} 
                  variant="outline" 
                  className="border-neutral-700 hover:bg-neutral-800 text-neutral-300"
                >
                  Clear filters
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {selectedResource && (
        <div className={`w-full lg:w-2/5 transition-all duration-500 ease-in-out transform ${
          detailsVisible ? "translate-x-0 opacity-100" : "translate-x-full opacity-0 absolute right-0"
        }`}>
          <div className="rounded-xl bg-neutral-900 shadow-lg shadow-neutral-800/30 p-6 relative">
          
            <h2 className="text-xl font-bold text-white mb-4">Resource Details</h2>
            
            {/* Preview Card - Now updates with formData in real-time */}
            <div className="bg-neutral-800 rounded-lg p-4 mb-6 ring-1 ring-neutral-700">
              <div className="w-full h-40 bg-neutral-700 rounded-md mb-3 bg-gradient-to-br from-neutral-700 to-neutral-800"></div>
              <h3 className="text-lg font-semibold text-white mb-2">{formData?.title || ""}</h3>
              <p className="text-neutral-400 text-sm truncate">{formData?.body || ""}</p>
              <div className="flex items-center justify-between mt-3">
                <span className="text-xs text-neutral-500">{formData?.category || ""}</span>
                {formData?.status && (
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    formData.status === "published" 
                      ? "bg-emerald-500/20 text-emerald-300 ring-1 ring-emerald-500/30" 
                      : "bg-amber-500/20 text-amber-300 ring-1 ring-amber-500/30"
                  }`}>
                    {formData.status}
                  </span>
                )}
              </div>
            </div>
            
            {/* Edit Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-neutral-300 block mb-1">
                  Title
                </label>
                <Input
                  name="title"
                  value={formData?.title || ""}
                  onChange={handleInputChange}
                  className="bg-neutral-800 border-neutral-700 text-white focus:ring-emerald-400 focus:border-emerald-400"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium text-neutral-300 block mb-1">
                  Body
                </label>
                <Textarea
                  name="body"
                  value={formData?.body || ""}
                  onChange={handleInputChange}
                  className="bg-neutral-800 border-neutral-700 text-white focus:ring-emerald-400 focus:border-emerald-400 min-h-24"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-neutral-300 block mb-1">
                    Category
                  </label>
                  <Input
                    name="category"
                    value={formData?.category || ""}
                    onChange={handleInputChange}
                    className="bg-neutral-800 border-neutral-700 text-white focus:ring-emerald-400 focus:border-emerald-400"
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium text-neutral-300 block mb-1">
                    Status
                  </label>
                  <select
                    name="status"
                    value={formData?.status || ""}
                    onChange={handleInputChange}
                    className="w-full rounded-md bg-neutral-800 border-neutral-700 text-white focus:ring-emerald-400 focus:border-emerald-400 p-2"
                  >
                    <option value="published">Published</option>
                    <option value="awaiting">Awaiting</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-neutral-300 block mb-1">
                  URL
                </label>
                <Input
                  name="url"
                  value={formData?.url || ""}
                  onChange={handleInputChange}
                  className="bg-neutral-800 border-neutral-700 text-white focus:ring-emerald-400 focus:border-emerald-400"
                />
              </div>
              
              <div className="flex gap-3 pt-4">
                <Button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white hover:from-emerald-500 hover:to-emerald-400 group"
                >
                  <span>Save Changes</span>
                  <Save size={16} className="ml-2 transition-transform duration-300 group-hover:translate-y-px" />
                </Button>
                
                <Button
                  type="button"
                  onClick={handleDelete}
                  className="bg-red-900/30 text-red-400 hover:bg-red-900/50"
                >
                  <Trash size={16} />
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}