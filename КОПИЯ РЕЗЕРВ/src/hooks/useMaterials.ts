// src/hooks/useMaterials.ts
import { useMemo } from 'react';
import { FrameParams, FoundationParams, WeldingParams, MaterialPrices } from '../types/types';

const materialPrices: MaterialPrices = {
    profileTubes: {
        "15x15": 150, "20x20": 180, "25x25": 220, "30x30": 260,
        "40x20": 280, "40x40": 320, "50x25": 350, "60x30": 400,
        "60x40": 420, "80x40": 480, "100x50": 550, "100x100": 650,
        "120x120": 800
    },
    rebar: {
        "6": 45, "8": 55, "10": 65, "12": 80, "14": 95, "16": 110,
        "18": 130, "20": 150
    },
    welding: {
        "15x15": 70, "20x20": 95, "25x25": 120, "30x20": 120,
        "30x30": 145, "40x20": 145, "40x25": 155, "40x40": 195,
        "50x25": 180, "50x30": 195, "50x50": 240, "60x30": 215,
        "60x40": 240, "60x60": 290, "80x40": 290, "80x60": 320,
        "80x80": 380, "100x50": 360, "100x100": 480, "120x120": 600
    }
};

export const useMaterialInfo = (
    frameParams: FrameParams,
    foundationParams: FoundationParams,
    weldingParams: WeldingParams
) => {
    return useMemo(() => {
        const {
            length, width, height, numColumns, columnSection, trussSection, purlinSection,
            trussHeightLeft, trussHeightRight, trussCount,
            frontOverhang, rearOverhang, leftSideOverhang, rightSideOverhang,
            topPurlinSpacing, numBaysLeft, numBaysRight
        } = frameParams;

        const { rebarThickness } = foundationParams;
        const { weldType } = weldingParams;

        // Расчет длины профилей
        const columnsLength = trussCount * 2 * height;
        const trussLength = trussCount * (length * 1.5 + (trussHeightLeft + trussHeightRight) * 2);
        const purlinsLength = Math.ceil((length + frontOverhang + rearOverhang) / topPurlinSpacing) *
            (trussCount - 1) * (width + leftSideOverhang + rightSideOverhang);

        // Расчет количества соединений
        const columnConnections = trussCount * 2 * 2;
        const trussConnections = trussCount * (numBaysLeft + numBaysRight + 1) * 3;
        const purlinConnections = Math.ceil((length + frontOverhang + rearOverhang) / topPurlinSpacing) *
            (trussCount - 1) * 2;

        const totalConnections = columnConnections + trussConnections + purlinConnections;

        // Определяем размеры профилей
        const columnSize = `${columnSection * 1000}x${columnSection * 1000}`;
        const trussSize = `${trussSection * 1000}x${trussSection * 1000}`;
        const purlinSize = `${purlinSection * 1000}x${(purlinSection * 500).toFixed(0)}`;
        const rebarSize = `${rebarThickness}`;

        // Получаем цены на материалы
        const columnPrice = materialPrices.profileTubes[columnSize] || 300;
        const trussPrice = materialPrices.profileTubes[trussSize] || 250;
        const purlinPrice = materialPrices.profileTubes[purlinSize] || 200;
        const rebarPrice = materialPrices.rebar[rebarSize] || 60;

        // Получаем цену сварки
        const columnWeldPrice = materialPrices.welding[columnSize] || 150;
        const trussWeldPrice = materialPrices.welding[trussSize] || 120;
        const purlinWeldPrice = materialPrices.welding[purlinSize] || 100;

        // Расчет стоимости материалов
        const columnsCost = columnsLength * columnPrice;
        const trussCost = trussLength * trussPrice;
        const purlinsCost = purlinsLength * purlinPrice;
        const totalMaterialCost = columnsCost + trussCost + purlinsCost;

        // Расчет стоимости сварки
        const columnWeldingCost = columnConnections * columnWeldPrice;
        const trussWeldingCost = trussConnections * trussWeldPrice;
        const purlinWeldingCost = purlinConnections * purlinWeldPrice;
        const totalWeldingCost = columnWeldingCost + trussWeldingCost + purlinWeldingCost;

        // Вес конструкций
        const columnWeight = columnSection === 0.1 ? 8.9 :
            (columnSection === 0.08 ? 5.8 : 12.3);
        const trussWeight = trussSection === 0.08 ? 5.8 :
            (trussSection === 0.1 ? 8.9 : 3.5);
        const purlinWeight = purlinSection === 0.04 ? 1.9 :
            (purlinSection === 0.05 ? 2.4 : 3.1);

        const totalWeight = columnsLength * columnWeight + trussLength * trussWeight + purlinsLength * purlinWeight;

        return {
            materialInfo: {
                columnSize,
                trussSize,
                purlinSize,
                rebarSize,
                columnsLength,
                trussLength,
                purlinsLength,
                columnWeight,
                trussWeight,
                purlinWeight,
                totalWeight,
                totalMaterialCost
            },
            weldingInfo: {
                totalConnections,
                columnWeldingCost,
                trussWeldingCost,
                purlinWeldingCost,
                totalWeldingCost,
                weldType
            }
        };
    }, [frameParams, foundationParams, weldingParams]);
};