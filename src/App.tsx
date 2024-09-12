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
  useEffect(() => {
    fetch("https://api.artic.edu/api/v1/artworks?page=1").then((res) =>
      res.json().then((data) => {
        setProducts(data.data);
      })
    );
  }, []);
  return (
    <div className="container">
      <DataTable value={products} tableStyle={{ minWidth: "50rem" }}>
        {columns.map((col) => (
          <Column key={col.field} field={col.field} header={col.header} />
        ))}
      </DataTable>
    </div>
  );
}

export default App;
