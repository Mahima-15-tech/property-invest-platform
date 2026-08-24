  import { useState, useEffect } from "react";
  import { Card } from "../components/ui/card";
  import { Button } from "../components/ui/button";
  import { Input } from "../components/ui/input";
  import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
  } from "../components/ui/table";
  import { StatusBadge } from "../components/status-badge";
  import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../components/ui/dialog";
  import { Badge } from "../components/ui/badge";
  import { Search, Filter, Download, Eye } from "lucide-react";
  import React from "react";
  import {getTransactions } from "../../api/transaction";
  import { updateTransaction } from "../../api/transaction";
  import { createManualTransaction } from "../../api/transaction";
  import { getUsersList } from "../../api/user";
import { getPropertiesList } from "../../api/property";



  export function Transactions() {
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedTransaction, setSelectedTransaction] = useState(null);
    const [transactions, setTransactions] = useState([]);
    const [page, setPage] = useState(1);
const [itemsPerPage] = useState(6);
    const [open, setOpen] = useState(false);
    const [users, setUsers] = useState([]);
const [properties, setProperties] = useState([]);
    const [form, setForm] = useState({
      userId: "",
      propertyId: "",
      amount: "",
      method: "Cash",
    });

  
    
    const fetchTransactions = async () => {
      const res = await getTransactions();
      setTransactions(res.data);
    };

    useEffect(() => {
      fetchTransactions();
      fetchDropdowns();
    }, []);
    
    const fetchDropdowns = async () => {
      try {
        const usersRes = await getUsersList();
        const propRes = await getPropertiesList();
    
        console.log("USERS API:", usersRes);
        console.log("USERS DATA:", usersRes.data);
    
        console.log("PROPERTIES API:", propRes);
        console.log("PROPERTIES DATA:", propRes.data);
    
        setUsers(usersRes.data);
        setProperties(propRes.data);
      } catch (err) {
        console.log("ERROR:", err);
      }
    };

    const handleStatusChange = async (id, status) => {
      try {
        await updateTransaction(id, status);
    
        // refresh list
        fetchTransactions();
    
        // close dialog
        setSelectedTransaction(null);
    
      } catch (err) {
        console.log(err);
      }
    };

    const handleAddTransaction = async () => {
      try {
    
        if (!form.userId || !form.propertyId || !form.amount) {
          alert("Please fill all fields");
          return;
        }
    
        await createManualTransaction(form);
    
        fetchTransactions();
        setOpen(false);
    
        setForm({
          userId: "",
          propertyId: "",
          amount: "",
          method: "Cash",
        });
    
      } catch (err) {
        console.log(err);
      }
    };

    const filteredTransactions = transactions.filter((tx) =>
    
      tx.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.investor.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.property.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);

const startIndex = (page - 1) * itemsPerPage;
const currentTransactions = filteredTransactions.slice(
  startIndex,
  startIndex + itemsPerPage
);

const Pagination = ({ page, totalPages, setPage }) => {
  return (
    <div className="flex justify-center mt-6">
      <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl shadow-sm border">

        <button
          disabled={page === 1}
          onClick={() => setPage(page - 1)}
          className="px-3 py-1 rounded-lg hover:bg-gray-100 disabled:opacity-40"
        >
          ←
        </button>

        {[...Array(totalPages)].map((_, i) => {
          const p = i + 1;

          if (
            p === 1 ||
            p === totalPages ||
            (p >= page - 1 && p <= page + 1)
          ) {
            return (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`w-9 h-9 rounded-lg text-sm ${
                  page === p
                    ? "bg-[#0F766E] text-white shadow"
                    : "hover:bg-gray-100"
                }`}
              >
                {p}
              </button>
            );
          }

          if (p === page - 2 || p === page + 2) {
            return <span key={p}>...</span>;
          }

          return null;
        })}

        <button
          disabled={page === totalPages}
          onClick={() => setPage(page + 1)}
          className="px-3 py-1 rounded-lg hover:bg-gray-100 disabled:opacity-40"
        >
          →
        </button>

      </div>
    </div>
  );
};

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-foreground">Transactions</h1>
            <p className="text-muted-foreground mt-1">Monitor and manage all financial transactions</p>
          </div>

          <div className="space-x-6">
          <Button onClick={() => setOpen(true)}>
    + Add Transaction
  </Button>
        
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
          </div>
        </div>

        {/* Filters */}
        <Card className="p-4">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search transactions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline" className="gap-2">
              <Filter className="h-4 w-4" />
              Filter
            </Button>
          </div>
        </Card>

        {/* Table */}
        <Card className="p-4 rounded-2xl shadow-md">
          <div className="overflow-x-auto">
            <Table>
            <TableHeader className="bg-gray-100">
                <TableRow>
                  <TableHead>Transaction ID</TableHead>
                  <TableHead>Investor</TableHead>
                  <TableHead>Property</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
              {currentTransactions.map((tx) => (
                  <TableRow 
                  key={tx.id} 
                  className={`cursor-pointer transition-all duration-200 hover:bg-gray-50 ${
                    transactions.indexOf(tx) % 2 === 0 ? "bg-white" : "bg-gray-50"
                  }`}
                >
                    <TableCell className="font-mono font-medium">{tx.id}</TableCell>
                    <TableCell>{tx.investor}</TableCell>
                    <TableCell>{tx.property}</TableCell>
                    <TableCell className="font-medium">{tx.amount}</TableCell>
                    <TableCell className="text-sm">
                      <div>{tx.date}</div>
                      <div className="text-muted-foreground">{tx.time}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{tx.method}</Badge>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={tx.status} />
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedTransaction(tx)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>

        <div className="flex items-center justify-between mt-6">

  <div className="text-sm text-muted-foreground">
    Page {page} of {totalPages}
  </div>

  <Pagination
    page={page}
    totalPages={totalPages}
    setPage={setPage}
  />

</div>

        {/* Dialog */}
        <Dialog open={!!selectedTransaction} onOpenChange={() => setSelectedTransaction(null)}>
          <DialogContent className="max-w-2xl">
            {selectedTransaction && (
              <>
                <DialogHeader>
                  <DialogTitle>Transaction Details</DialogTitle>
                </DialogHeader>

                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-6">

                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Transaction ID</p>
                      <p className="font-mono font-medium">{selectedTransaction.id}</p>
                    </div>

                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Status</p>
                      <StatusBadge status={selectedTransaction.status} />
                    </div>

                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Investor</p>
                      <p className="font-medium">{selectedTransaction.investor}</p>
                    </div>

                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Property</p>
                      <p className="font-medium">{selectedTransaction.property}</p>
                    </div>

                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Amount</p>
                      <p className="text-2xl font-semibold">{selectedTransaction.amount}</p>
                    </div>

                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Payment Method</p>
                      <Badge variant="secondary">{selectedTransaction.method}</Badge>
                    </div>

                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Date</p>
                      <p className="font-medium">{selectedTransaction.date}</p>
                    </div>

                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Time</p>
                      <p className="font-medium">{selectedTransaction.time}</p>
                    </div>

                  </div>

                  {/* Timeline */}
                  <div className="border-t pt-4">
                    <h4 className="font-semibold mb-3">Timeline</h4>

                    <div className="space-y-4">

                      <div className="flex gap-3">
                        <div className="w-2 h-2 rounded-full bg-green-500 mt-1.5" />
                        <div>
                          <p className="font-medium">Transaction Initiated</p>
                          <p className="text-sm text-muted-foreground">
                            {selectedTransaction.date} at {selectedTransaction.time}
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <div className="w-2 h-2 rounded-full bg-green-500 mt-1.5" />
                        <div>
                          <p className="font-medium">Payment Verified</p>
                          <p className="text-sm text-muted-foreground">
                            {selectedTransaction.date} at {selectedTransaction.time}
                          </p>
                        </div>
                      </div>

                      {selectedTransaction.status === "completed" && (
                        <div className="flex gap-3">
                          <div className="w-2 h-2 rounded-full bg-green-500 mt-1.5" />
                          <div>
                            <p className="font-medium">Transaction Completed</p>
                            <p className="text-sm text-muted-foreground">
                              {selectedTransaction.date} at {selectedTransaction.time}
                            </p>
                          </div>
                        </div>
                      )}

                    </div>
                  </div>

                  {/* Actions */}
                  {selectedTransaction.status === "pending" && (
                    <div className="flex gap-2">
                      <Button
    className="flex-1"
    onClick={() =>
      handleStatusChange(selectedTransaction.mongoId, "completed")
    }
  >
    Approve
  </Button>

  <Button
    variant="destructive"
    className="flex-1"
    onClick={() =>
      handleStatusChange(selectedTransaction.mongoId, "rejected")
    }
  >
    Reject
  </Button>
                    </div>
                  )}

                </div>
              </>
            )}
          </DialogContent>
        </Dialog>

        <Dialog open={open} onOpenChange={setOpen}>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Add Transaction</DialogTitle>
      </DialogHeader>

      <div className="space-y-4">
      <select
  className="w-full border p-2 rounded"
  value={form.userId}
  onChange={(e) => setForm({ ...form, userId: e.target.value })}
>
  <option value="">Select User</option>
  {users.map((u) => (
    <option key={u._id} value={u._id}>
      {u.name}
    </option>
  ))}
</select>

<select
  className="w-full border p-2 rounded"
  value={form.propertyId}
  onChange={(e) => setForm({ ...form, propertyId: e.target.value })}
>
  <option value="">Select Property</option>
  {properties.map((p) => (
    <option key={p._id} value={p._id}>
      {p.name}
    </option>
  ))}
</select>

<Input
  placeholder="Amount"
  type="number"
  value={form.amount}
  onChange={(e) => setForm({ ...form, amount: e.target.value })}
/>

      

        <Button onClick={handleAddTransaction}>
          Save
        </Button>
      </div>
    </DialogContent>
  </Dialog>

      </div>
    );
  }