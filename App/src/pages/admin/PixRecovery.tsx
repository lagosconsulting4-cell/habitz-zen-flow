import { useState, useMemo } from "react";
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type RowSelectionState,
  type SortingState,
} from "@tanstack/react-table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import { TableSkeleton } from "@/components/ui/skeleton";
import { MetricCard } from "@/components/admin/MetricCard";
import { PixRecoveryCard } from "@/components/admin/PixRecoveryCard";
import { usePixRecovery, type PixRecoveryLead, type PixRecoveryFilters } from "@/hooks/usePixRecovery";
import { useIsMobile } from "@/hooks/useMediaQuery";
import { exportPixRecoveryToCSV } from "@/utils/csvExport";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Download,
  MoreHorizontal,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  DollarSign,
  CheckCircle,
  Package,
  Clock,
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";

const urgencyBadge = (urgency: string) => {
  switch (urgency) {
    case "fresh":
      return <Badge className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300 border-0">Fresco (24h)</Badge>;
    case "recent":
      return <Badge className="bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300 border-0">Recente (3d)</Badge>;
    case "aging":
      return <Badge className="bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300 border-0">Envelhecendo</Badge>;
    default:
      return <Badge variant="secondary">Antigo (7d+)</Badge>;
  }
};

const productBadge = (product: string) => {
  switch (product) {
    case "Bora App":
      return <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 border-0">Bora</Badge>;
    case "Foquinha AI":
      return <Badge className="bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 border-0">Foquinha</Badge>;
    default:
      return <Badge variant="outline">{product}</Badge>;
  }
};

const AdminPixRecovery = () => {
  const isMobile = useIsMobile();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [filters, setFilters] = useState<PixRecoveryFilters>({});
  const [sorting, setSorting] = useState<SortingState>([
    { id: "created_at", desc: true },
  ]);

  const sortBy = useMemo(() => {
    if (sorting.length === 0) {
      return { column: "created_at" as const, direction: "desc" as const };
    }
    const sort = sorting[0];
    return {
      column: sort.id as "created_at" | "email" | "amount_cents" | "product_label",
      direction: sort.desc ? ("desc" as const) : ("asc" as const),
    };
  }, [sorting]);

  const {
    leads,
    totalCount,
    totalPages,
    currentPage,
    isLoading,
    summary,
    summaryLoading,
    markExported,
    isMarkingExported,
    fetchAllForExport,
  } = usePixRecovery({ page, search, filters, sortBy });

  // Column definitions
  const columns: ColumnDef<PixRecoveryLead>[] = useMemo(
    () => [
      {
        id: "select",
        header: ({ table }) => (
          <Checkbox
            checked={table.getIsAllPageRowsSelected()}
            onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
            aria-label="Selecionar todos"
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Selecionar linha"
          />
        ),
        enableSorting: false,
      },
      {
        accessorKey: "email",
        header: ({ column }) => (
          <Button variant="ghost" size="sm" className="h-8 -ml-3" onClick={() => column.toggleSorting()}>
            Email
            {column.getIsSorted() === "asc" ? <ArrowUp className="ml-1 h-3 w-3" /> : column.getIsSorted() === "desc" ? <ArrowDown className="ml-1 h-3 w-3" /> : <ArrowUpDown className="ml-1 h-3 w-3" />}
          </Button>
        ),
        cell: ({ row }) => (
          <span className="text-sm break-all">{row.original.email || "—"}</span>
        ),
      },
      {
        accessorKey: "name",
        header: "Nome",
        cell: ({ row }) => (
          <span className="text-sm">{row.original.name || "—"}</span>
        ),
      },
      {
        accessorKey: "product_label",
        header: ({ column }) => (
          <Button variant="ghost" size="sm" className="h-8 -ml-3" onClick={() => column.toggleSorting()}>
            Produto
            {column.getIsSorted() === "asc" ? <ArrowUp className="ml-1 h-3 w-3" /> : column.getIsSorted() === "desc" ? <ArrowDown className="ml-1 h-3 w-3" /> : <ArrowUpDown className="ml-1 h-3 w-3" />}
          </Button>
        ),
        cell: ({ row }) => productBadge(row.original.product_label),
      },
      {
        accessorKey: "amount_cents",
        header: ({ column }) => (
          <Button variant="ghost" size="sm" className="h-8 -ml-3" onClick={() => column.toggleSorting()}>
            Valor
            {column.getIsSorted() === "asc" ? <ArrowUp className="ml-1 h-3 w-3" /> : column.getIsSorted() === "desc" ? <ArrowDown className="ml-1 h-3 w-3" /> : <ArrowUpDown className="ml-1 h-3 w-3" />}
          </Button>
        ),
        cell: ({ row }) => (
          <span className="text-sm font-medium">
            R$ {(row.original.amount_cents / 100).toFixed(2)}
          </span>
        ),
      },
      {
        accessorKey: "urgency",
        header: "Urgência",
        cell: ({ row }) => urgencyBadge(row.original.urgency),
      },
      {
        accessorKey: "created_at",
        header: ({ column }) => (
          <Button variant="ghost" size="sm" className="h-8 -ml-3" onClick={() => column.toggleSorting()}>
            Data
            {column.getIsSorted() === "asc" ? <ArrowUp className="ml-1 h-3 w-3" /> : column.getIsSorted() === "desc" ? <ArrowDown className="ml-1 h-3 w-3" /> : <ArrowUpDown className="ml-1 h-3 w-3" />}
          </Button>
        ),
        cell: ({ row }) => (
          <span className="text-sm text-muted-foreground">
            {format(new Date(row.original.created_at), "dd/MM/yy HH:mm", { locale: ptBR })}
          </span>
        ),
      },
      {
        accessorKey: "exported_at",
        header: "Exportado",
        cell: ({ row }) =>
          row.original.exported_at ? (
            <Badge variant="outline" className="border-green-300 text-green-600 text-xs">
              <CheckCircle className="w-3 h-3 mr-1" />
              {format(new Date(row.original.exported_at), "dd/MM", { locale: ptBR })}
            </Badge>
          ) : (
            <span className="text-xs text-muted-foreground">—</span>
          ),
      },
    ],
    []
  );

  // Hide some columns on mobile
  const visibleColumns = isMobile
    ? columns.filter((c) => !["name", "exported_at", "urgency"].includes((c as { accessorKey?: string }).accessorKey || ""))
    : columns;

  const table = useReactTable({
    data: leads,
    columns: visibleColumns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    state: { rowSelection, sorting },
    manualPagination: true,
    manualSorting: true,
    pageCount: totalPages,
    getRowId: (row) => `${row.source_table}:${row.id}`,
  });

  const selectedCount = Object.keys(rowSelection).length;

  const handleExportCSV = async () => {
    try {
      const allLeads = await fetchAllForExport();
      const dateStr = format(new Date(), "yyyy-MM-dd");
      const productSuffix = filters.product && filters.product !== "all" ? `-${filters.product.replace(" ", "-")}` : "";
      exportPixRecoveryToCSV(allLeads, `pix-recovery${productSuffix}-${dateStr}.csv`);
      toast.success(`${allLeads.length} leads exportados`);
    } catch {
      toast.error("Erro ao exportar");
    }
  };

  const handleExportSelected = () => {
    const selectedKeys = Object.keys(rowSelection);
    const selectedLeads = leads.filter((l) => selectedKeys.includes(`${l.source_table}:${l.id}`));
    if (selectedLeads.length === 0) return;
    const dateStr = format(new Date(), "yyyy-MM-dd");
    exportPixRecoveryToCSV(selectedLeads, `pix-recovery-selecionados-${dateStr}.csv`);
    toast.success(`${selectedLeads.length} leads exportados`);
  };

  const handleMarkExported = async () => {
    const selectedKeys = Object.keys(rowSelection);
    const selectedLeads = leads.filter((l) => selectedKeys.includes(`${l.source_table}:${l.id}`));
    if (selectedLeads.length === 0) return;

    try {
      const ids = selectedLeads.map((l) => l.id);
      const sourceTables = selectedLeads.map((l) => l.source_table);
      await markExported({ ids, sourceTables });
      toast.success(`${selectedLeads.length} marcados como exportados`);
      setRowSelection({});
    } catch {
      toast.error("Erro ao marcar como exportado");
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Recuperação de Pix</h1>
        <p className="text-sm text-muted-foreground">
          Clientes que geraram Pix mas não pagaram — segmentados por produto
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total Pendente"
          value={summary?.total_open || 0}
          icon={<Clock className="h-4 w-4" />}
          loading={summaryLoading}
          description={`${summary?.not_exported || 0} novos`}
        />
        <MetricCard
          title="Bora App"
          value={summary?.bora_open || 0}
          icon={<Package className="h-4 w-4" />}
          loading={summaryLoading}
        />
        <MetricCard
          title="Foquinha AI"
          value={summary?.foquinha_open || 0}
          icon={<Package className="h-4 w-4" />}
          loading={summaryLoading}
        />
        <MetricCard
          title="Valor Total"
          value={`R$ ${((summary?.total_amount_cents || 0) / 100).toFixed(0)}`}
          icon={<DollarSign className="h-4 w-4" />}
          loading={summaryLoading}
        />
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por email ou nome..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="pl-10"
          />
        </div>

        <Select
          value={filters.product || "all"}
          onValueChange={(v) => {
            setFilters((f) => ({ ...f, product: v as PixRecoveryFilters["product"] }));
            setPage(1);
          }}
        >
          <SelectTrigger className="w-full sm:w-[150px]">
            <SelectValue placeholder="Produto" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="Bora App">Bora App</SelectItem>
            <SelectItem value="Foquinha AI">Foquinha AI</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={filters.exported || "all"}
          onValueChange={(v) => {
            setFilters((f) => ({ ...f, exported: v as PixRecoveryFilters["exported"] }));
            setPage(1);
          }}
        >
          <SelectTrigger className="w-full sm:w-[150px]">
            <SelectValue placeholder="Exportado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="not_exported">Novos</SelectItem>
            <SelectItem value="exported">Exportados</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex gap-2">
          <Input
            type="date"
            value={filters.date_from || ""}
            onChange={(e) => {
              setFilters((f) => ({ ...f, date_from: e.target.value || undefined }));
              setPage(1);
            }}
            className="w-[140px]"
            aria-label="Data de"
          />
          <Input
            type="date"
            value={filters.date_to || ""}
            onChange={(e) => {
              setFilters((f) => ({ ...f, date_to: e.target.value || undefined }));
              setPage(1);
            }}
            className="w-[140px]"
            aria-label="Data até"
          />
        </div>
      </div>

      {/* Bulk actions bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {selectedCount > 0 && (
            <>
              <Badge variant="secondary">{selectedCount} selecionados</Badge>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <MoreHorizontal className="h-4 w-4 mr-1" />
                    Ações
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={handleExportSelected}>
                    <Download className="h-4 w-4 mr-2" />
                    Exportar selecionados
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleMarkExported} disabled={isMarkingExported}>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Marcar como exportado
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          )}
        </div>
        <Button variant="outline" size="sm" onClick={handleExportCSV}>
          <Download className="h-4 w-4 mr-1" />
          Exportar CSV
        </Button>
      </div>

      {/* Table / Card list */}
      {isLoading ? (
        <TableSkeleton />
      ) : leads.length === 0 ? (
        <div className="text-center py-12">
          <DollarSign className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
          <h3 className="text-lg font-medium">Nenhum Pix pendente</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Não há compras com status "open" nos filtros selecionados.
          </p>
        </div>
      ) : isMobile ? (
        <div className="space-y-2">
          {leads.map((lead) => {
            const key = `${lead.source_table}:${lead.id}`;
            return (
              <PixRecoveryCard
                key={key}
                lead={lead}
                isSelected={!!rowSelection[key]}
                onSelect={(checked) => {
                  setRowSelection((prev) => {
                    const next = { ...prev };
                    if (checked) next[key] = true;
                    else delete next[key];
                    return next;
                  });
                }}
              />
            );
          })}
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {totalCount} registros · Página {currentPage} de {totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPixRecovery;
