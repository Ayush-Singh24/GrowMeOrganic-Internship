import "./App.css";
import "primereact/resources/themes/lara-light-indigo/theme.css"; //theme
import "primereact/resources/primereact.min.css"; //core css
import "./App.css";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { useEffect, useState } from "react";

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
  const [products, setProducts] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  useEffect(() => {
    fetch("https://api.artic.edu/api/v1/artworks?page=2").then((res) =>
      res.json().then((parsedRes) => {
        setProducts(parsedRes.data);
      })
    );
  }, []);
  return (
    <div className="container">
      <DataTable
        selectionMode={"checkbox"}
        selection={selectedProducts}
        onSelectionChange={(e) => setSelectedProducts(e.value)}
        dataKey="id"
        value={products}
        paginator
        rows={12}
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
    </div>
  );
}

export default App;
