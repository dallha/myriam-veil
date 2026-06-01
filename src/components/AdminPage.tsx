/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * AdminPage — Full-page admin dashboard with its own URL (/admin)
 * This wraps the existing AdminDashboard as a proper page instead of a modal overlay.
 */

import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Product, Order, HomepageContent } from "../types";
import AdminDashboard from "./AdminDashboard";
import { authService } from "../authService";

interface AdminPageProps {
  products: Product[];
  orders: Order[];
  homepageContent: HomepageContent;
  onUpdateHomepageContent: (content: HomepageContent) => void;
  onAddProduct: (collectionId: "couture" | "ecrin" | "heritage") => void;
  onEditProduct: (product: Product) => void;
  onDuplicateProduct: (product: Product) => void;
  onUpdateProductVisibility: (productId: string, visible: boolean) => void;
  onDeleteProduct: (productId: string) => void;
  onUpdateOrderStatus: (orderId: string, status: Order["status"]) => void;
  onDeleteOrder: (orderId: string) => void;
  onSave: () => void;
  onExport: () => void;
  onImport: (file: File) => void;
  onReset: () => void;
  onLogout: () => void;
  hasUnsavedChanges: boolean;
  isAdminMode: boolean;
}

export default function AdminPage({
  products,
  orders,
  homepageContent,
  onUpdateHomepageContent,
  onAddProduct,
  onEditProduct,
  onDuplicateProduct,
  onUpdateProductVisibility,
  onDeleteProduct,
  onUpdateOrderStatus,
  onDeleteOrder,
  onSave,
  onExport,
  onImport,
  onReset,
  onLogout,
  hasUnsavedChanges,
  isAdminMode
}: AdminPageProps) {
  const navigate = useNavigate();

  // Redirect to home if not in admin mode
  useEffect(() => {
    if (!isAdminMode) {
      navigate("/", { replace: true });
    }
  }, [isAdminMode, navigate]);

  if (!isAdminMode) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#02040a]">
      <AdminDashboard
        isOpen={true}
        onClose={() => navigate("/")}
        products={products}
        orders={orders}
        homepageContent={homepageContent}
        onUpdateHomepageContent={onUpdateHomepageContent}
        onAddProduct={onAddProduct}
        onEditProduct={onEditProduct}
        onDuplicateProduct={onDuplicateProduct}
        onUpdateProductVisibility={onUpdateProductVisibility}
        onDeleteProduct={onDeleteProduct}
        onUpdateOrderStatus={onUpdateOrderStatus}
        onDeleteOrder={onDeleteOrder}
        onSave={onSave}
        onExport={onExport}
        onImport={onImport}
        onReset={onReset}
        onLogout={onLogout}
        hasUnsavedChanges={hasUnsavedChanges}
      />
    </div>
  );
}
