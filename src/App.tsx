import "./App.css";
import "primereact/resources/themes/lara-light-indigo/theme.css"; //theme
import "primereact/resources/primereact.min.css"; //core css
import {
  DataTable,
  DataTableSelectionMultipleChangeEvent,
} from "primereact/datatable";
import { Column } from "primereact/column";
import { useCallback, useEffect, useRef, useState } from "react";
import { Paginator, PaginatorPageChangeEvent } from "primereact/paginator";
import { OverlayPanel } from "primereact/overlaypanel";

const DEFAULT_ROWS_PER_PAGE = 12;
const ROWS_PER_PAGE_OPTIONS = [DEFAULT_ROWS_PER_PAGE, 24, 36];

type Artwork = {
  id: number;
  title: string;
  place_of_origin: string;
  artist_display: string;
  inscriptions: string;
  date_start: string;
  date_end: string;
};

type ColumnType = {
  field: keyof Artwork;
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
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [selectedArtworkIds, setSelectedArtworkIds] = useState<Set<number>>(
    new Set()
  );
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [first, setFirst] = useState<number>(0);
  const [selectCount, setSelectCount] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<
    (typeof ROWS_PER_PAGE_OPTIONS)[number]
  >(DEFAULT_ROWS_PER_PAGE);
  const [totalRecords, setTotalRecords] = useState<number | undefined>(
    undefined
  );

  const fetchData = useCallback(
    async (page: number, limit: number = DEFAULT_ROWS_PER_PAGE) => {
      setIsLoading(true);
      try {
        const response = await fetch(
          `https://api.artic.edu/api/v1/artworks?page=${page}&limit=${limit}`
        );
        const { data, pagination } = await response.json();
        return { data, totalRecords: pagination.total };
      } catch (error) {
        console.error("Failed to fetch artworks:", error);
        return { data: [], totalRecords: 0 };
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const loadPage = useCallback(
    async (page: number, rows: number = DEFAULT_ROWS_PER_PAGE) => {
      const { data, totalRecords } = await fetchData(page, rows);
      setArtworks(data);
      setTotalRecords(totalRecords);
    },
    [fetchData]
  );

  const onPageChange = (event: PaginatorPageChangeEvent) => {
    if (isLoading) return; // Disable page change while loading

    setFirst(event.first);
    setRowsPerPage(event.rows);
    loadPage(event.page + 1, event.rows);
  };

  const op = useRef<OverlayPanel>(null);

  const handleOverlay = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (op.current) {
      op.current.toggle(event);
    }
  };

  //Custom function for handling selections
  const handleSelection = (
    event: DataTableSelectionMultipleChangeEvent<Artwork[]>
  ) => {
    const newSelections = new Set<number>(selectedArtworkIds);
    event.value.forEach((art) => newSelections.add(art.id));
    artworks.forEach((art) => {
      if (!event.value.some((selected) => selected.id === art.id)) {
        newSelections.delete(art.id);
      }
    });
    setSelectedArtworkIds(newSelections);
  };

  // Function for Custom Selection Panel(Overlay)
  const handleSubmit = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    if (op.current) {
      op.current.hide();
    }
    if (selectCount <= 0) return;
    const selectedIds = new Set<number>();
    let page = 1;

    while (selectedIds.size < selectCount) {
      const { data } = await fetchData(page, rowsPerPage);
      if (data.length === 0) break;

      for (const artwork of data) {
        if (selectedIds.size < selectCount) {
          selectedIds.add(artwork.id);
        } else {
          break;
        }
      }
      page++;
    }
    setSelectedArtworkIds(selectedIds);
  };

  useEffect(() => {
    loadPage(1);
  }, [loadPage]);

  return (
    <>
      <div className="container">
        <DataTable
          loading={isLoading}
          selectionMode={"checkbox"}
          first={2}
          rows={rowsPerPage}
          selection={artworks.filter((art) => selectedArtworkIds.has(art.id))}
          onSelectionChange={handleSelection}
          dataKey="id"
          value={artworks}
          tableStyle={{ minWidth: "50rem" }}
        >
          <Column
            selectionMode="multiple"
            headerStyle={{ width: "3rem" }}
          ></Column>
          <Column
            headerStyle={{ width: "3rem" }}
            header={
              <button
                type="button"
                className="chevron-dropdown"
                onClick={handleOverlay}
              >
                <img className="chevron" src="/chevron-down.svg" />
              </button>
            }
          ></Column>
          {columns.map((col) => (
            <Column key={col.field} field={col.field} header={col.header} />
          ))}
        </DataTable>
        <Paginator
          first={first}
          rows={rowsPerPage}
          totalRecords={totalRecords}
          onPageChange={onPageChange}
          rowsPerPageOptions={ROWS_PER_PAGE_OPTIONS}
        />
      </div>
      <OverlayPanel ref={op}>
        <div className="overlaypanel-container">
          <input
            type="number"
            className="overlaypanel-input"
            placeholder="Enter Number of rows"
            value={selectCount}
            onChange={(e) => setSelectCount(Number(e.currentTarget.value))}
          />
          <button
            type="submit"
            className="overlaypanel-button"
            onClick={handleSubmit}
          >
            Submit
          </button>
        </div>
      </OverlayPanel>
    </>
  );
}

export default App;
