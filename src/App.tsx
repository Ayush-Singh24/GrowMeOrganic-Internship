import "./App.css";
import "primereact/resources/themes/lara-light-indigo/theme.css"; //theme
import "primereact/resources/primereact.min.css"; //core css
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { useCallback, useEffect, useState } from "react";
import { Paginator, PaginatorPageChangeEvent } from "primereact/paginator";

type ColumnType = {
  field: string;
  header: string;
};

const columns: ColumnType[] = [
  { field: "title", header: "Title" },
  { field: "place_of_origin", header: "Origin" },
  { field: "artist_display", header: "Artist" },
  { field: "inscriptions", header: "Inscriptions" },
  { field: "date_start", header: "Start" },
  { field: "date_end", header: "End" },
];

function App() {
  const [artworks, setArtworks] = useState([]);
  const [selectedArtworks, setSelectedArtworks] = useState([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [first, setFirst] = useState<number>(0);
  const [totalRecords, setTotalRecords] = useState<number | undefined>(
    undefined
  );

  const fetchDataByPage = useCallback(async (page: number) => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `https://api.artic.edu/api/v1/artworks?page=${page}`
      );
      const parsedResponse = await response.json();
      setArtworks(parsedResponse.data);
      setTotalRecords(parsedResponse.pagination.total);
    } catch (error) {
      console.error("Failed to fetch artworks:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const onPageChange = (event: PaginatorPageChangeEvent) => {
    setFirst(event.first);
    fetchDataByPage(event.page + 1);
  };

  useEffect(() => {
    fetchDataByPage(1);
  }, [fetchDataByPage]);

  return (
    <div className="container">
      <DataTable
        loading={isLoading}
        selectionMode={"checkbox"}
        first={2}
        rows={12}
        selection={selectedArtworks}
        onSelectionChange={(e) => setSelectedArtworks(e.value)}
        dataKey="id"
        value={artworks}
        tableStyle={{ minWidth: "50rem" }}
      >
        <Column
          selectionMode="multiple"
          headerStyle={{ width: "3rem" }}
        ></Column>
        {columns.map((col) => (
          <Column key={col.field} field={col.field} header={col.header} />
        ))}
      </DataTable>
      <Paginator
        first={first}
        rows={12}
        totalRecords={totalRecords}
        onPageChange={onPageChange}
      />
    </div>
  );
}

export default App;
