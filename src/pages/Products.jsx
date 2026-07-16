import { useId, useMemo, useState } from "react";
import {
  AlertTriangle,
  Boxes,
  Copy,
  Download,
  Edit3,
  Eye,
  Filter,
  Grid2X2,
  ImageOff,
  ImagePlus,
  Layers3,
  List,
  MoreHorizontal,
  PackageCheck,
  PackagePlus,
  Plus,
  Search,
  Star,
  Trash2,
  TrendingUp,
  Upload,
  X,
} from "lucide-react";
import Modal from "../components/Modal";
import ConfirmDialog from "../components/ConfirmDialog";
import EmptyState from "../components/EmptyState";
import {
  downloadFile,
  formatCurrency,
  formatDate,
  makeId,
  toCsv,
} from "../utils/formatters";

const blankProduct = {
  name: "",
  sku: "",
  category: "",
  supplierId: "",
  brand: "",
  unit: "Piece",
  description: "",
  image: "",
  price: "",
  cost: "",
  stock: "",
  reorderLevel: 10,
  location: "",
  barcode: "",
  status: "Active",
  featured: false,
};

function resizeProductImage(file) {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith("image/")) {
      reject(new Error("Please choose a valid image file."));
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      reject(new Error("Image size must be below 8 MB."));
      return;
    }

    const reader = new FileReader();

    reader.onerror = () => reject(new Error("The selected image could not be read."));
    reader.onload = () => {
      const image = new Image();

      image.onerror = () => reject(new Error("The selected image is not supported."));
      image.onload = () => {
        const maxSize = 1000;
        const scale = Math.min(1, maxSize / Math.max(image.width, image.height));
        const width = Math.max(1, Math.round(image.width * scale));
        const height = Math.max(1, Math.round(image.height * scale));
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");

        canvas.width = width;
        canvas.height = height;

        if (!context) {
          reject(new Error("Image processing is not available in this browser."));
          return;
        }

        context.fillStyle = "#ffffff";
        context.fillRect(0, 0, width, height);
        context.drawImage(image, 0, 0, width, height);
        resolve(canvas.toDataURL("image/webp", 0.82));
      };

      image.src = reader.result;
    };

    reader.readAsDataURL(file);
  });
}

function ProductImage({ product, className, iconSize = 18 }) {
  if (product.image) {
    return (
      <img
        className={className}
        src={product.image}
        alt={product.name || "Product"}
      />
    );
  }

  return <Boxes size={iconSize} aria-hidden="true" />;
}

function ProductForm({ product, categories, suppliers, onSave, onClose }) {
  const uploadId = useId();
  const [form, setForm] = useState(() => ({
    ...blankProduct,
    ...(product || {}),
  }));
  const [imageError, setImageError] = useState("");
  const [imageLoading, setImageLoading] = useState(false);


  const update = (key, value) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) return;

    setImageError("");
    setImageLoading(true);

    try {
      const image = await resizeProductImage(file);
      update("image", image);
    } catch (error) {
      setImageError(error instanceof Error ? error.message : "Image upload failed.");
    } finally {
      setImageLoading(false);
    }
  };

  const submit = (event) => {
    event.preventDefault();

    onSave({
      ...form,
      id: form.id || makeId("prd"),
      name: form.name.trim(),
      sku: form.sku.trim().toUpperCase(),
      brand: form.brand.trim(),
      description: form.description.trim(),
      price: Number(form.price),
      cost: Number(form.cost),
      stock: Number(form.stock),
      reorderLevel: Number(form.reorderLevel),
      createdAt: form.createdAt || new Date().toISOString().slice(0, 10),
      updatedAt: new Date().toISOString().slice(0, 10),
    });
  };

  return (
    <form onSubmit={submit} className="form-layout product-form-layout">
      <section className="product-image-upload">
        <div className={`product-image-preview ${form.image ? "has-image" : ""}`}>
          {form.image ? (
            <img src={form.image} alt="Product preview" />
          ) : (
            <div className="product-image-placeholder">
              <ImagePlus size={30} />
              <strong>Add a product image</strong>
              <span>JPG, PNG or WebP · Maximum 8 MB</span>
            </div>
          )}
        </div>

        <div className="product-image-controls">
          <div>
            <strong>Product image</strong>
            <p>The image is compressed automatically before it is saved.</p>
          </div>

          <div className="product-image-buttons">
            <label className="button secondary image-upload-button" htmlFor={uploadId}>
              <Upload size={16} />
              {imageLoading ? "Processing…" : form.image ? "Change image" : "Upload image"}
            </label>
            <input
              id={uploadId}
              className="visually-hidden-input"
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={handleImageUpload}
              disabled={imageLoading}
            />

            {form.image && (
              <button
                type="button"
                className="button danger subtle"
                onClick={() => update("image", "")}
              >
                <ImageOff size={16} /> Remove
              </button>
            )}
          </div>

          {imageError && <span className="field-error">{imageError}</span>}
        </div>
      </section>

      <div className="form-grid two">
        <label className="field">
          <span>Product name *</span>
          <input
            required
            value={form.name}
            onChange={(event) => update("name", event.target.value)}
            placeholder="e.g. Wireless mouse"
          />
        </label>

        <label className="field">
          <span>SKU *</span>
          <input
            required
            value={form.sku}
            onChange={(event) => update("sku", event.target.value)}
            placeholder="ELE-WMS-1011"
          />
        </label>

        <label className="field">
          <span>Category *</span>
          <select
            required
            value={form.category}
            onChange={(event) => update("category", event.target.value)}
          >
            <option value="">Choose category</option>
            {categories
              .filter((category) => category.status === "Active")
              .map((category) => (
                <option key={category.id}>{category.name}</option>
              ))}
          </select>
        </label>

        <label className="field">
          <span>Supplier</span>
          <select
            value={form.supplierId}
            onChange={(event) => update("supplierId", event.target.value)}
          >
            <option value="">No supplier</option>
            {suppliers.map((supplier) => (
              <option key={supplier.id} value={supplier.id}>
                {supplier.name}
              </option>
            ))}
          </select>
        </label>

        <label className="field">
          <span>Brand</span>
          <input
            value={form.brand}
            onChange={(event) => update("brand", event.target.value)}
            placeholder="e.g. InventoryPro"
          />
        </label>

        <label className="field">
          <span>Unit</span>
          <select value={form.unit} onChange={(event) => update("unit", event.target.value)}>
            <option>Piece</option>
            <option>Box</option>
            <option>Pack</option>
            <option>Set</option>
            <option>Kg</option>
            <option>Litre</option>
          </select>
        </label>

        <label className="field">
          <span>Selling price *</span>
          <input
            required
            type="number"
            min="0"
            value={form.price}
            onChange={(event) => update("price", event.target.value)}
          />
        </label>

        <label className="field">
          <span>Cost price *</span>
          <input
            required
            type="number"
            min="0"
            value={form.cost}
            onChange={(event) => update("cost", event.target.value)}
          />
        </label>

        <label className="field">
          <span>Opening stock *</span>
          <input
            required
            type="number"
            min="0"
            value={form.stock}
            onChange={(event) => update("stock", event.target.value)}
          />
        </label>

        <label className="field">
          <span>Reorder level</span>
          <input
            type="number"
            min="0"
            value={form.reorderLevel}
            onChange={(event) => update("reorderLevel", event.target.value)}
          />
        </label>

        <label className="field">
          <span>Warehouse location</span>
          <input
            value={form.location}
            onChange={(event) => update("location", event.target.value)}
            placeholder="A-01-03"
          />
        </label>

        <label className="field">
          <span>Barcode</span>
          <input
            value={form.barcode}
            onChange={(event) => update("barcode", event.target.value)}
            placeholder="89010001011"
          />
        </label>

        <label className="field">
          <span>Status</span>
          <select value={form.status} onChange={(event) => update("status", event.target.value)}>
            <option>Active</option>
            <option>Draft</option>
            <option>Archived</option>
          </select>
        </label>

        <label className="toggle-field">
          <input
            type="checkbox"
            checked={form.featured}
            onChange={(event) => update("featured", event.target.checked)}
          />
          <span>
            <strong>Featured product</strong>
            <small>Highlight this item in product views</small>
          </span>
        </label>

        <label className="field full-field">
          <span>Description</span>
          <textarea
            rows="4"
            value={form.description}
            onChange={(event) => update("description", event.target.value)}
            placeholder="Add a short product description, specifications or notes."
          />
        </label>
      </div>

      <div className="modal-actions">
        <button type="button" className="button secondary" onClick={onClose}>
          Cancel
        </button>
        <button className="button primary" type="submit" disabled={imageLoading}>
          {product ? "Save changes" : "Create product"}
        </button>
      </div>
    </form>
  );
}

export default function Products({
  products,
  setProducts,
  categories,
  suppliers,
  settings,
  globalSearch,
  addActivity,
  toast,
  openCreateSignal,
}) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [stockFilter, setStockFilter] = useState("All");
  const [sort, setSort] = useState("Recently updated");
  const [view, setView] = useState("table");
  const [page, setPage] = useState(1);
  const [rows, setRows] = useState(8);
  const [selected, setSelected] = useState([]);
  const [editing, setEditing] = useState(openCreateSignal ? blankProduct : null);
  const [details, setDetails] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [menuId, setMenuId] = useState(null);


  const query = `${globalSearch || ""} ${search}`.trim().toLowerCase();

  const filtered = useMemo(() => {
    const result = products.filter((product) => {
      const matchesQuery =
        !query ||
        [
          product.name,
          product.sku,
          product.category,
          product.barcode,
          product.location,
          product.brand,
          product.description,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(query);

      const matchesCategory = category === "All" || product.category === category;
      const matchesStock =
        stockFilter === "All" ||
        (stockFilter === "In stock" && product.stock > product.reorderLevel) ||
        (stockFilter === "Low stock" && product.stock > 0 && product.stock <= product.reorderLevel) ||
        (stockFilter === "Out of stock" && product.stock === 0) ||
        product.status === stockFilter;

      return matchesQuery && matchesCategory && matchesStock;
    });

    result.sort((first, second) => {
      if (sort === "Name A-Z") return first.name.localeCompare(second.name);
      if (sort === "Price high-low") return second.price - first.price;
      if (sort === "Stock low-high") return first.stock - second.stock;
      return new Date(second.updatedAt) - new Date(first.updatedAt);
    });

    return result;
  }, [products, query, category, stockFilter, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / rows));
  const currentPage = Math.min(page, totalPages);
  const visible = filtered.slice((currentPage - 1) * rows, currentPage * rows);

  const supplierName = (id) =>
    suppliers.find((supplier) => supplier.id === id)?.name || "Not assigned";

  const stockState = (product) =>
    product.stock === 0 ? "out" : product.stock <= product.reorderLevel ? "low" : "healthy";

  const productInsights = useMemo(
    () => ({
      total: products.length,
      active: products.filter((product) => product.status === "Active").length,
      low: products.filter(
        (product) => product.stock > 0 && product.stock <= product.reorderLevel,
      ).length,
      out: products.filter((product) => product.stock === 0).length,
      value: products.reduce(
        (sum, product) => sum + Number(product.price || 0) * Number(product.stock || 0),
        0,
      ),
    }),
    [products],
  );

  const saveProduct = (product) => {
    if (!product.name || !product.sku || !product.category) {
      toast("Complete all required product fields.", "error");
      return;
    }

    const duplicate = products.some(
      (item) =>
        item.sku.toLowerCase() === product.sku.toLowerCase() && item.id !== product.id,
    );

    if (duplicate) {
      toast("That SKU already exists.", "error");
      return;
    }

    const exists = products.some((item) => item.id === product.id);

    setProducts((current) =>
      exists
        ? current.map((item) => (item.id === product.id ? product : item))
        : [product, ...current],
    );

    addActivity(
      "product",
      exists ? "Product updated" : "Product created",
      product.name,
    );
    toast(exists ? "Product updated successfully." : "Product created successfully.");
    setEditing(null);
  };

  const duplicateProduct = (product) => {
    const today = new Date().toISOString().slice(0, 10);
    const copy = {
      ...product,
      id: makeId("prd"),
      name: `${product.name} Copy`,
      sku: `${product.sku}-COPY`,
      featured: false,
      createdAt: today,
      updatedAt: today,
    };

    setProducts((current) => [copy, ...current]);
    addActivity("product", "Product duplicated", copy.name);
    toast("Product duplicated.", "info");
    setMenuId(null);
  };

  const removeProduct = () => {
    if (!deleteTarget) return;

    setProducts((current) => current.filter((item) => item.id !== deleteTarget.id));
    setSelected((current) => current.filter((id) => id !== deleteTarget.id));
    addActivity("product", "Product deleted", deleteTarget.name);
    toast("Product deleted.", "warning");
    setDeleteTarget(null);
  };

  const bulkDelete = () => {
    setProducts((current) => current.filter((item) => !selected.includes(item.id)));
    addActivity("product", "Bulk products deleted", `${selected.length} records removed`);
    toast(`${selected.length} products deleted.`, "warning");
    setSelected([]);
  };

  const exportCsv = () => {
    const rowsData = filtered.map((product) => ({
      SKU: product.sku,
      Name: product.name,
      Brand: product.brand || "",
      Category: product.category,
      Supplier: supplierName(product.supplierId),
      Price: product.price,
      Cost: product.cost,
      Stock: product.stock,
      Unit: product.unit || "Piece",
      ReorderLevel: product.reorderLevel,
      Location: product.location,
      Status: product.status,
    }));

    downloadFile("inventory-products.csv", toCsv(rowsData), "text/csv");
    toast("Product CSV exported.", "info");
  };

  const toggleSelectAll = () => {
    const ids = visible.map((item) => item.id);
    const allSelected = ids.every((id) => selected.includes(id));

    setSelected(
      allSelected
        ? selected.filter((id) => !ids.includes(id))
        : [...new Set([...selected, ...ids])],
    );
  };

  return (
    <div className="page-stack products-page-stack">
      <section className="products-hero-next">
        <div className="products-hero-copy">
          <span className="section-kicker">Smart catalog workspace</span>
          <h1>Products that stay organized.</h1>
          <p>
            Control images, pricing, stock health, suppliers and catalog performance from
            one clean workspace.
          </p>
          <div className="heading-actions">
            <button className="button secondary" onClick={exportCsv}>
              <Download size={16} /> Export catalog
            </button>
            <button className="button primary" onClick={() => setEditing({ ...blankProduct })}>
              <Plus size={17} /> Add product
            </button>
          </div>
        </div>

        <div className="products-hero-orb">
          <PackagePlus size={34} />
          <span>Catalog value</span>
          <strong>{formatCurrency(productInsights.value, settings.currency)}</strong>
          <small>Current retail stock value</small>
        </div>
      </section>

      <section className="product-insight-grid">
        <button onClick={() => setStockFilter("All")}>
          <span className="insight-icon indigo"><Boxes size={18} /></span>
          <div><small>Total products</small><strong>{productInsights.total}</strong><em>All catalog records</em></div>
        </button>
        <button onClick={() => setStockFilter("Active")}>
          <span className="insight-icon green"><PackageCheck size={18} /></span>
          <div><small>Active items</small><strong>{productInsights.active}</strong><em>Ready for selling</em></div>
        </button>
        <button onClick={() => setStockFilter("Low stock")}>
          <span className="insight-icon amber"><AlertTriangle size={18} /></span>
          <div><small>Low stock</small><strong>{productInsights.low}</strong><em>Needs attention</em></div>
        </button>
        <button onClick={() => setStockFilter("Out of stock")}>
          <span className="insight-icon rose"><TrendingUp size={18} /></span>
          <div><small>Out of stock</small><strong>{productInsights.out}</strong><em>Restock priority</em></div>
        </button>
        <button onClick={() => setCategory("All")}>
          <span className="insight-icon cyan"><Layers3 size={18} /></span>
          <div><small>Categories</small><strong>{categories.length}</strong><em>Catalog groups</em></div>
        </button>
      </section>

      <section className="toolbar-card nextgen-toolbar">
        <div className="toolbar-search">
          <Search size={17} />
          <input
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
            placeholder="Search product, SKU, barcode or location"
          />
          {search && (
            <button onClick={() => setSearch("")} aria-label="Clear product search">
              <X size={15} />
            </button>
          )}
        </div>

        <div className="toolbar-filters">
          <label>
            <Filter size={15} />
            <select
              value={category}
              onChange={(event) => {
                setCategory(event.target.value);
                setPage(1);
              }}
            >
              <option>All</option>
              {categories.map((item) => (
                <option key={item.id}>{item.name}</option>
              ))}
            </select>
          </label>

          <select
            value={stockFilter}
            onChange={(event) => {
              setStockFilter(event.target.value);
              setPage(1);
            }}
          >
            <option>All</option>
            <option>In stock</option>
            <option>Low stock</option>
            <option>Out of stock</option>
            <option>Draft</option>
            <option>Archived</option>
          </select>

          <select value={sort} onChange={(event) => setSort(event.target.value)}>
            <option>Recently updated</option>
            <option>Name A-Z</option>
            <option>Price high-low</option>
            <option>Stock low-high</option>
          </select>

          <div className="segmented">
            <button
              className={view === "table" ? "active" : ""}
              onClick={() => setView("table")}
              aria-label="Table view"
            >
              <List size={16} />
            </button>
            <button
              className={view === "grid" ? "active" : ""}
              onClick={() => setView("grid")}
              aria-label="Grid view"
            >
              <Grid2X2 size={16} />
            </button>
          </div>
        </div>
      </section>

      {selected.length > 0 && (
        <div className="selection-bar">
          <span><strong>{selected.length}</strong> selected</span>
          <div>
            <button className="button ghost" onClick={() => setSelected([])}>Clear</button>
            <button className="button danger subtle" onClick={bulkDelete}>
              <Trash2 size={15} /> Delete selected
            </button>
          </div>
        </div>
      )}

      {filtered.length === 0 ? (
        <EmptyState
          title="No products found"
          message="Try a different search or add a new product to your catalog."
          actionLabel="Add product"
          onAction={() => setEditing({ ...blankProduct })}
        />
      ) : view === "table" ? (
        <section className="data-card table-scroll products-data-card">
          <table className="data-table product-table">
            <thead>
              <tr>
                <th>
                  <input
                    type="checkbox"
                    checked={visible.length > 0 && visible.every((item) => selected.includes(item.id))}
                    onChange={toggleSelectAll}
                  />
                </th>
                <th>Product</th>
                <th>Category</th>
                <th>Supplier</th>
                <th>Price</th>
                <th>Stock health</th>
                <th>Status</th>
                <th>Updated</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {visible.map((product) => (
                <tr key={product.id}>
                  <td>
                    <input
                      type="checkbox"
                      checked={selected.includes(product.id)}
                      onChange={() =>
                        setSelected((current) =>
                          current.includes(product.id)
                            ? current.filter((id) => id !== product.id)
                            : [...current, product.id],
                        )
                      }
                    />
                  </td>
                  <td>
                    <button className="product-cell" onClick={() => setDetails(product)}>
                      <span className={`product-thumb ${stockState(product)} ${product.image ? "has-image" : ""}`}>
                        <ProductImage product={product} className="product-thumb-image" />
                      </span>
                      <span>
                        <strong>
                          {product.name}
                          {product.featured && <Star size={12} fill="currentColor" />}
                        </strong>
                        <small>{product.sku}{product.brand ? ` · ${product.brand}` : ""}</small>
                      </span>
                    </button>
                  </td>
                  <td><span className="soft-chip">{product.category}</span></td>
                  <td>{supplierName(product.supplierId)}</td>
                  <td>
                    <strong>{formatCurrency(product.price, settings.currency)}</strong>
                    <small className="muted-block">Cost {formatCurrency(product.cost, settings.currency)}</small>
                  </td>
                  <td>
                    <div className="stock-health">
                      <div><strong>{product.stock}</strong><span>/ reorder {product.reorderLevel}</span></div>
                      <div className={`stock-line ${stockState(product)}`}>
                        <i
                          style={{
                            width: `${Math.min(
                              100,
                              Math.max(
                                4,
                                (product.stock / Math.max(product.reorderLevel * 2, 1)) * 100,
                              ),
                            )}%`,
                          }}
                        />
                      </div>
                    </div>
                  </td>
                  <td><span className={`status-pill ${product.status.toLowerCase()}`}>{product.status}</span></td>
                  <td>{formatDate(product.updatedAt, { year: undefined })}</td>
                  <td className="actions-cell">
                    <button
                      className="icon-button small"
                      onClick={() => setMenuId(menuId === product.id ? null : product.id)}
                      aria-label={`Actions for ${product.name}`}
                    >
                      <MoreHorizontal size={17} />
                    </button>
                    {menuId === product.id && (
                      <div className="row-menu">
                        <button onClick={() => { setDetails(product); setMenuId(null); }}><Eye size={15} /> View details</button>
                        <button onClick={() => { setEditing(product); setMenuId(null); }}><Edit3 size={15} /> Edit</button>
                        <button onClick={() => duplicateProduct(product)}><Copy size={15} /> Duplicate</button>
                        <button className="danger" onClick={() => { setDeleteTarget(product); setMenuId(null); }}><Trash2 size={15} /> Delete</button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      ) : (
        <section className="product-grid">
          {visible.map((product) => (
            <article className="product-card" key={product.id}>
              <div className="product-card-top">
                <span className={`product-card-icon ${stockState(product)} ${product.image ? "has-image" : ""}`}>
                  <ProductImage product={product} className="product-card-image" iconSize={24} />
                </span>
                <button
                  className="icon-button small"
                  onClick={() => setMenuId(menuId === product.id ? null : product.id)}
                  aria-label={`Actions for ${product.name}`}
                >
                  <MoreHorizontal size={17} />
                </button>
                {menuId === product.id && (
                  <div className="row-menu card-menu">
                    <button onClick={() => { setDetails(product); setMenuId(null); }}><Eye size={15} /> View</button>
                    <button onClick={() => { setEditing(product); setMenuId(null); }}><Edit3 size={15} /> Edit</button>
                    <button onClick={() => duplicateProduct(product)}><Copy size={15} /> Duplicate</button>
                    <button className="danger" onClick={() => { setDeleteTarget(product); setMenuId(null); }}><Trash2 size={15} /> Delete</button>
                  </div>
                )}
              </div>
              <div className="product-card-copy">
                <span>{product.category}</span>
                <h3>{product.name}</h3>
                <p>{product.sku} · {product.location || "No location"}</p>
              </div>
              <div className="product-card-price">
                <strong>{formatCurrency(product.price, settings.currency)}</strong>
                <span>{product.stock} {product.unit || "units"}</span>
              </div>
              <div className={`stock-line ${stockState(product)}`}>
                <i
                  style={{
                    width: `${Math.min(
                      100,
                      Math.max(
                        4,
                        (product.stock / Math.max(product.reorderLevel * 2, 1)) * 100,
                      ),
                    )}%`,
                  }}
                />
              </div>
              <div className="product-card-footer">
                <span className={`status-pill ${product.status.toLowerCase()}`}>{product.status}</span>
                <button className="text-button" onClick={() => setDetails(product)}>
                  Details <Eye size={14} />
                </button>
              </div>
            </article>
          ))}
        </section>
      )}

      {filtered.length > 0 && (
        <div className="pagination-bar">
          <span>
            Showing {(currentPage - 1) * rows + 1}-{Math.min(currentPage * rows, filtered.length)} of {filtered.length}
          </span>
          <div className="pagination-controls">
            <select
              value={rows}
              onChange={(event) => {
                setRows(Number(event.target.value));
                setPage(1);
              }}
            >
              <option value="8">8 / page</option>
              <option value="12">12 / page</option>
              <option value="20">20 / page</option>
            </select>
            <button disabled={currentPage === 1} onClick={() => setPage(currentPage - 1)}>Previous</button>
            <span>Page {currentPage} of {totalPages}</span>
            <button disabled={currentPage === totalPages} onClick={() => setPage(currentPage + 1)}>Next</button>
          </div>
        </div>
      )}

      <Modal
        open={Boolean(editing)}
        title={editing?.id ? "Edit product" : "Add new product"}
        subtitle="Keep catalog information accurate and complete."
        onClose={() => setEditing(null)}
        size="large"
      >
        <ProductForm
          product={editing?.id ? editing : null}
          categories={categories}
          suppliers={suppliers}
          onSave={saveProduct}
          onClose={() => setEditing(null)}
        />
      </Modal>

      <Modal
        open={Boolean(details)}
        title="Product details"
        subtitle={details?.sku}
        onClose={() => setDetails(null)}
        size="medium"
      >
        {details && (
          <div className="detail-stack">
            <div className="detail-hero">
              <span className={`detail-icon ${stockState(details)} ${details.image ? "has-image" : ""}`}>
                {details.image ? (
                  <img src={details.image} alt={details.name} />
                ) : (
                  <PackagePlus size={26} />
                )}
              </span>
              <div>
                <span>{details.category}</span>
                <h3>{details.name}</h3>
                <p>{details.status} · Updated {formatDate(details.updatedAt)}</p>
              </div>
            </div>

            {details.description && <p className="product-detail-description">{details.description}</p>}

            <div className="detail-grid">
              <div><span>Selling price</span><strong>{formatCurrency(details.price, settings.currency)}</strong></div>
              <div><span>Cost price</span><strong>{formatCurrency(details.cost, settings.currency)}</strong></div>
              <div><span>Available stock</span><strong>{details.stock} {details.unit || "units"}</strong></div>
              <div><span>Reorder level</span><strong>{details.reorderLevel}</strong></div>
              <div><span>Supplier</span><strong>{supplierName(details.supplierId)}</strong></div>
              <div><span>Brand</span><strong>{details.brand || "—"}</strong></div>
              <div><span>Location</span><strong>{details.location || "—"}</strong></div>
              <div><span>Barcode</span><strong>{details.barcode || "—"}</strong></div>
              <div><span>Created</span><strong>{formatDate(details.createdAt)}</strong></div>
            </div>

            <div className="modal-actions">
              <button
                className="button secondary"
                onClick={() => {
                  setEditing(details);
                  setDetails(null);
                }}
              >
                <Edit3 size={16} /> Edit product
              </button>
              <button
                className="button primary"
                onClick={() => {
                  setDetails(null);
                  toast("Barcode label prepared for printing.", "info");
                }}
              >
                <Upload size={16} /> Print label
              </button>
            </div>
          </div>
        )}
      </Modal>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete product?"
        message={`This will permanently remove ${deleteTarget?.name || "this product"} from your catalog.`}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={removeProduct}
      />
    </div>
  );
}
