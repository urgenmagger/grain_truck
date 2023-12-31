import React, { FC, useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useGetVehicles } from "../../api/hooks/useGetVehicles";
import { TextButton } from "../../common/components/buttons/textButton/TextButton";

import {
  categoryMap,
  VehiclesData,
  VehicleCategory,
} from "../../common/types/vehicle";
import { Screens } from "../../navigation/typeNav";
import { VehicleList } from "./components/vehicleList";
import { CategoryBlock } from "./components/categoryBlock";
import { useTranslation } from "../../common/components/hooks/translate";
import { FullScreenLoader } from "../../common/components/FullScreenLoader";
import { useFilteredDataContext } from "../../api/providers/FilteredDataProvider";

// Главный экран
export const HomeScreen: FC = () => {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const { data, isLoading } = useGetVehicles();
  const { setFilteredDataContext } = useFilteredDataContext();

  const [selectedCategory, setSelectedCategory] = useState<VehicleCategory[]>(
    []
  );

  const [filteredData, setFilteredData] = useState<VehiclesData>({
    vehicles: [],
  });

  const goMapScreen = () => {
    setFilteredDataContext(filteredData);
    navigation.navigate(Screens.MapScreen);
  };

  /**
   * Обработчик нажатия на категорию транспортного средства.
   *
   *
   * @param {VehicleCategory} category - Выбранная категория транспортного средства.
   * @returns {void}
   */
  const handleCategoryPress = (category: VehicleCategory) => {
    setSelectedCategory((prevSelectedCategory) => {
      if (prevSelectedCategory.length === 0) {
        return [category];
      } else {
        const isSelected = prevSelectedCategory.includes(category);
        if (isSelected) {
          return prevSelectedCategory.filter(
            (prevCategory) => prevCategory !== category
          );
        } else {
          return [...prevSelectedCategory, category];
        }
      }
    });
  };

  /**
   * В реальном проекте фильтры будут браться из бэкенда
   * Применяет фильтр по выбранным категориям и обновляет отфильтрованные данные.
   *
   * @param {VehicleCategory[] | undefined} categories - Выбранные категории транспортных средств.
   * @returns {void}
   */
  const applyFilter = (categories: VehicleCategory[] | undefined) => {
    if (!categories || categories.length === 0) {
      setFilteredData({ vehicles: data?.vehicles || [] });
    } else {
      const selectedIds = categories
        .map((category) => categoryMap[category]?.id)
        .filter(Boolean);
      if (selectedIds.length > 0) {
        let filtered = (data?.vehicles || []).filter((vehicle) =>
          selectedIds.includes(vehicle?.categoryId)
        );
        setFilteredData({ vehicles: filtered });
      }
    }
  };

  useEffect(() => {
    applyFilter(selectedCategory);
  }, [selectedCategory, data]);

  return (
    <View style={styles.container}>
      {isLoading && <FullScreenLoader />}
      <CategoryBlock onCategoryPress={handleCategoryPress} />
      <TextButton
        marginBottom={20}
        label={t("SEE_MAP")}
        onPress={goMapScreen}
      />
      <VehicleList data={filteredData || { vehicles: [] }} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    height: 200,
    paddingHorizontal: 20,
    marginTop: 20,
  },
});
