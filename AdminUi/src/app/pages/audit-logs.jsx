import { Card } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import { Badge } from "../components/ui/badge";
import { Search, Filter, Download } from "lucide-react";
import React from "react";
import { useEffect, useState } from "react";
import { getAuditLogs } from "../../api/audit";



const typeColors = {
  create: "bg-success/10 text-success",
  approval: "bg-primary/10 text-primary",
  transaction: "bg-warning/10 text-warning",
  security: "bg-destructive/10 text-destructive",
  update: "bg-accent text-accent-foreground",
};

export function AuditLogs() {
  const [logs, setLogs] = useState([]);

useEffect(() => {
  const fetchLogs = async () => {
    const res = await getAuditLogs();
    setLogs(res.data);
  };

  fetchLogs();
}, []);
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-foreground">Audit Logs</h1>
          <p className="text-muted-foreground mt-1">Track all system activities and changes</p>
        </div>
        <Button variant="outline" className="gap-2">
          <Download className="h-4 w-4" />
          Export Logs
        </Button>
      </div>

      <Card className="p-4">
        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input type="search" placeholder="Search logs..." className="pl-10" />
          </div>
          <Button variant="outline" className="gap-2">
            <Filter className="h-4 w-4" />
            Filter
          </Button>
        </div>
      </Card>

      <Card>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Action</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Details</TableHead>
                <TableHead>Timestamp</TableHead>
                <TableHead>Type</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
            {logs.map((log) => (
  <TableRow key={log._id}>
    <TableCell>{log.action}</TableCell>
    <TableCell>{log.user?.name}</TableCell>
    <TableCell>{log.details}</TableCell>
    <TableCell>
      {new Date(log.createdAt).toLocaleString()}
    </TableCell>
    <TableCell>
      <Badge className={typeColors[log.type]}>
        {log.type}
      </Badge>
    </TableCell>
  </TableRow>
))}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}