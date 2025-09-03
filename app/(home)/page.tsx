"use client";

import { Carousel } from "@/components/carousel";
import { CategoryCarouselApi } from "@/components/category";
import { getCategories } from "@/utils/api/category";
import { getPromotions } from "@/utils/api/promotion";
import { useLanguage } from "@/providers/language-provider";
import { useEffect, useState } from "react";
import { getProducts } from "@/utils/api/product";
import { ProductCard } from "@/components/product-card";
import { Button } from "@/components/ui/button";

export default function Home() {
  const { t } = useLanguage();
  const [events, setEvents] = useState<any[]>([]);
  const [apiCategories, setApiCategories] = useState<any[]>([]);
  const [categoryStack, setCategoryStack] = useState<any[]>([
    { id: null, parentId: null },
  ]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    const fetchCarouselData = async () => {
      const promotions = await getPromotions();
      setEvents(promotions);
    };
    fetchCarouselData();
  }, []);

  useEffect(() => {
    let isActive = true;
    const fetchCategories = async () => {
      try {
        const currentCategory = categoryStack[categoryStack.length - 1];
        const response = await getCategories(currentCategory.id ?? undefined);
        if (isActive) {
          setApiCategories(response.data);
        }
      } catch (error: any) {
        setPopupMessage(t("home.errorFetchCategories"));
        setShowPopup(true);
        setTimeout(() => setShowPopup(false), 3000);
      }
    };
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const currentCategory = categoryStack[categoryStack.length - 1];
        const params = currentCategory.id
          ? { categoryId: currentCategory.id, limit: 10 }
          : { limit: 10 };
        const response = await getProducts(params);
        if (isActive) {
          setProducts(response.data.items || response.data || []);
        }
      } catch (error: any) {
        setPopupMessage(t("home.errorFetchProducts"));
        setShowPopup(true);
        setTimeout(() => setShowPopup(false), 3000);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
    fetchProducts();
    return () => {
      isActive = false;
    };
  }, [categoryStack, t]);

  const handleCategoryClick = (categoryId: string) => {
    setCategoryStack([
      ...categoryStack,
      { id: categoryId, parentId: categoryStack[categoryStack.length - 1].id },
    ]);
  };

  const handleBackClick = () => {
    if (categoryStack.length > 1) {
      setCategoryStack(categoryStack.slice(0, -1));
    }
  };

  return (
    <div className="w-full">
      <Carousel events={events} />
      <div className="mt-8">
        <CategoryCarouselApi
          apiCategories={apiCategories}
          onCategoryClick={handleCategoryClick}
        />
        {categoryStack.length > 1 && (
          <button
            className="mt-4 rounded bg-primary/20 px-4 py-2"
            onClick={handleBackClick}
          >
            {t("home.backToParentCategory")}
          </button>
        )}
        {showPopup && (
          <div className="fixed left-1/2 top-4 z-50 -translate-x-1/2 transform rounded bg-red-500 px-4 py-2 text-white shadow-lg">
            {popupMessage}
          </div>
        )}
      </div>
      <div className="mt-8 px-4">
        {loading ? (
          <div className="col-span-full flex justify-center items-center py-12">
            <span className="text-lg text-gray-500">Loading...</span>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {Array.isArray(products) && products.length > 0 ? (
              products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  isListView={false}
                />
              ))
            ) : (
              <div className="col-span-full text-center text-gray-400 py-8">
                {t("home.noProducts")}
              </div>
            )}
          </div>
        )}
      </div>
      {/* Other custom sections after product list */}
      <section className="mt-16 px-4">
        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
          <div className="bg-white dark:bg-zinc-900 rounded-xl shadow p-8 flex flex-col items-center">
            <span className="text-4xl font-bold text-primary mb-2">
              {t("home.statsCustomers")}
            </span>
            <span className="text-lg text-muted-foreground">
              {t("home.statsCustomersLabel")}
            </span>
          </div>
          <div className="bg-white dark:bg-zinc-900 rounded-xl shadow p-8 flex flex-col items-center">
            <span className="text-4xl font-bold text-muted-foreground mb-2">
              {t("home.statsProducts")}
            </span>
            <span className="text-lg text-muted-foreground">
              {t("home.statsProductsLabel")}
            </span>
          </div>
          <div className="bg-white dark:bg-zinc-900 rounded-xl shadow p-8 flex flex-col items-center">
            <span className="text-4xl font-bold text-yellow-500 mb-2">
              {t("home.statsDelivery")}
            </span>
            <span className="text-lg text-muted-foreground">
              {t("home.statsDeliveryLabel")}
            </span>
          </div>
        </div>
        {/* Call to Action Section */}
        <div className="bg-gradient-to-r from-primary/20 to-secondary/20 rounded-xl shadow-lg p-10 flex flex-col items-center mb-10">
          <h2 className="text-2xl font-bold mb-2">{t("home.ctaTitle")}</h2>
          <p className="text-muted-foreground mb-4 text-center">
            {t("home.ctaDesc")}
          </p>
          <Button className="rounded ">{t("home.ctaBtn")}</Button>
        </div>
      </section>
    </div>
  );
}
