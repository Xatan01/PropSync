import React, { useState } from "react";
import {
  Search,
  Filter,
  MoreVertical,
  ChevronDown,
  CheckCircle2,
  Clock,
  AlertCircle,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  properties: Property[];
}

interface Property {
  id: string;
  address: string;
  type: "HDB" | "Condo" | "Landed";
  transactionType: "Buy" | "Sell" | "Rent";
  status: "In Progress" | "Completed" | "On Hold";
  progress: number;
  nextTask: string;
  nextTaskDue: string;
}

const ClientList = ({ clients = defaultClients }: { clients?: Client[] }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "status" | "progress">("name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  const handleSort = (column: "name" | "status" | "progress") => {
    if (sortBy === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortDirection("asc");
    }
  };

  const filteredClients = clients.filter(
    (client) =>
      client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.properties.some((p) =>
        p.address.toLowerCase().includes(searchTerm.toLowerCase()),
      ),
  );

  const sortedClients = [...filteredClients].sort((a, b) => {
    if (sortBy === "name") {
      return sortDirection === "asc"
        ? a.name.localeCompare(b.name)
        : b.name.localeCompare(a.name);
    }
    return 0;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Completed":
        return "bg-green-500";
      case "In Progress":
        return "bg-blue-500";
      case "On Hold":
        return "bg-amber-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Completed":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case "In Progress":
        return <Clock className="h-4 w-4 text-blue-500" />;
      case "On Hold":
        return <AlertCircle className="h-4 w-4 text-amber-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="w-full bg-white p-6 rounded-lg shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Client Management</h2>
        <Button>Add New Client</Button>
      </div>

      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1">
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            size={18}
          />
          <Input
            placeholder="Search clients, properties, or emails..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="flex items-center gap-2">
              <Filter size={16} />
              Filter
              <ChevronDown size={16} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => {}}>All Clients</DropdownMenuItem>
            <DropdownMenuItem onClick={() => {}}>
              Active Transactions
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => {}}>
              Completed Transactions
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => {}}>On Hold</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead
                  className="w-[250px] cursor-pointer"
                  onClick={() => handleSort("name")}
                >
                  Client{" "}
                  {sortBy === "name" && (sortDirection === "asc" ? "↑" : "↓")}
                </TableHead>
                <TableHead>Properties</TableHead>
                <TableHead
                  className="cursor-pointer"
                  onClick={() => handleSort("status")}
                >
                  Status{" "}
                  {sortBy === "status" && (sortDirection === "asc" ? "↑" : "↓")}
                </TableHead>
                <TableHead
                  className="cursor-pointer"
                  onClick={() => handleSort("progress")}
                >
                  Progress{" "}
                  {sortBy === "progress" &&
                    (sortDirection === "asc" ? "↑" : "↓")}
                </TableHead>
                <TableHead>Next Task</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedClients.map((client) => (
                <React.Fragment key={client.id}>
                  {client.properties.map((property, index) => (
                    <TableRow key={`${client.id}-${property.id}`}>
                      {index === 0 && (
                        <TableCell
                          rowSpan={client.properties.length}
                          className="align-top pt-4"
                        >
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarImage
                                src={client.avatar}
                                alt={client.name}
                              />
                              <AvatarFallback>
                                {client.name.substring(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{client.name}</div>
                              <div className="text-sm text-gray-500">
                                {client.email}
                              </div>
                              <div className="text-sm text-gray-500">
                                {client.phone}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                      )}
                      <TableCell>
                        <div>
                          <div className="font-medium">{property.address}</div>
                          <div className="flex gap-2 mt-1">
                            <Badge variant="outline">{property.type}</Badge>
                            <Badge variant="outline">
                              {property.transactionType}
                            </Badge>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-2 h-2 rounded-full ${getStatusColor(property.status)}`}
                          ></div>
                          <span>{property.status}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <Progress value={property.progress} className="h-2" />
                          <div className="text-sm text-gray-500">
                            {property.progress}% Complete
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{property.nextTask}</div>
                          <div className="text-sm text-gray-500">
                            Due: {property.nextTaskDue}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" size="sm">
                            View Timeline
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>Add Task</DropdownMenuItem>
                              <DropdownMenuItem>Update Status</DropdownMenuItem>
                              <DropdownMenuItem>Send Reminder</DropdownMenuItem>
                              <DropdownMenuItem className="text-red-600">
                                Remove Property
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </React.Fragment>
              ))}
              {sortedClients.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center py-8 text-gray-500"
                  >
                    No clients found. Try adjusting your search or filters.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

// Default mock data
const defaultClients: Client[] = [
  {
    id: "1",
    name: "Sarah Johnson",
    email: "sarah.j@example.com",
    phone: "+65 9123 4567",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=sarah",
    properties: [
      {
        id: "p1",
        address: "123 Orchard Road, #12-34",
        type: "Condo",
        transactionType: "Buy",
        status: "In Progress",
        progress: 65,
        nextTask: "Option Fee Payment",
        nextTaskDue: "May 15, 2023",
      },
      {
        id: "p2",
        address: "456 Marina Bay, #08-11",
        type: "Condo",
        transactionType: "Sell",
        status: "On Hold",
        progress: 30,
        nextTask: "Valuation Report",
        nextTaskDue: "May 22, 2023",
      },
    ],
  },
  {
    id: "2",
    name: "Michael Tan",
    email: "michael.t@example.com",
    phone: "+65 8765 4321",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=michael",
    properties: [
      {
        id: "p3",
        address: "789 Tampines St 45, #05-123",
        type: "HDB",
        transactionType: "Sell",
        status: "Completed",
        progress: 100,
        nextTask: "None",
        nextTaskDue: "Completed",
      },
    ],
  },
  {
    id: "3",
    name: "Priya Singh",
    email: "priya.s@example.com",
    phone: "+65 9876 5432",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=priya",
    properties: [
      {
        id: "p4",
        address: "21 Bukit Timah Road",
        type: "Landed",
        transactionType: "Buy",
        status: "In Progress",
        progress: 45,
        nextTask: "Home Inspection",
        nextTaskDue: "May 18, 2023",
      },
    ],
  },
];

export default ClientList;
