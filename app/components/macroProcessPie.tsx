import { View, Text, StyleSheet } from 'react-native';
import React from 'react';
import Svg, { Circle, Path, G, Text as SvgText } from 'react-native-svg';

type MacroProcessPieProps = {
  protein: number;
  carbs: number;
  fat: number;
  calories?: number;
};

export default function MacroProcessPie({ protein, carbs, fat, calories = 0 }: MacroProcessPieProps) {
  const total = protein + carbs + fat;
  
  // Handle the case when all macros are 0
  let proteinPercentage = 0;
  let carbsPercentage = 0;
  let fatPercentage = 0;
  
  if (total > 0) {
    // Normal case - calculate actual percentages
    proteinPercentage = protein / total;
    carbsPercentage = carbs / total;
    fatPercentage = fat / total;
  } else {
    // If all macros are 0, display an equal distribution
    proteinPercentage = 0.33;
    carbsPercentage = 0.33;
    fatPercentage = 0.34;
  }

  // Calculate the angles for the pie chart
  const proteinAngle = proteinPercentage * 360;
  const carbsAngle = carbsPercentage * 360;
  const fatAngle = fatPercentage * 360;

  // SVG parameters
  const size = 100; // Reduced size for better fit in modal
  const radius = 44;
  const strokeWidth = 7;
  const center = size / 2;

  // Calculate the SVG paths for each segment
  const createArc = (startAngle: number, endAngle: number) => {
    const start = polarToCartesian(center, center, radius, endAngle);
    const end = polarToCartesian(center, center, radius, startAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? 0 : 1;
    
    return [
      "M", center, center,
      "L", start.x, start.y,
      "A", radius, radius, 0, largeArcFlag, 0, end.x, end.y,
      "Z"
    ].join(" ");
  };

  const polarToCartesian = (centerX: number, centerY: number, radius: number, angleInDegrees: number) => {
    const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
    return {
      x: centerX + (radius * Math.cos(angleInRadians)),
      y: centerY + (radius * Math.sin(angleInRadians))
    };
  };

  // Calculate paths
  const proteinPath = createArc(0, proteinAngle);
  const carbsPath = createArc(proteinAngle, proteinAngle + carbsAngle);
  const fatPath = createArc(proteinAngle + carbsAngle, 360);

  return (
    <View style={styles.container}>
      <View style={styles.contentRow}>
        <View style={styles.pieContainer}>
          <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
            <G>
              {/* If total is 0, show a gray outline circle instead of colored segments */}
              {total === 0 ? (
                <Circle 
                  cx={center} 
                  cy={center} 
                  r={radius} 
                  fill="none"
                  stroke="#E0E0E0" 
                  strokeWidth={strokeWidth} 
                />
              ) : (
                <>
                  {/* Protein segment */}
                  <Path d={proteinPath} fill="#F3B353" />
                  
                  {/* Carbs segment */}
                  <Path d={carbsPath} fill="#5CB4B0" />
                  
                  {/* Fat segment */}
                  <Path d={fatPath} fill="#FF3131" />
                </>
              )}
              
              {/* Inner circle (white space) */}
              <Circle cx={center} cy={center} r={radius - strokeWidth} fill="white" />
              
              {/* Calories text in the center */}
              <SvgText
                x={center}
                y={center}
                textAnchor="middle"
                fontSize="21"
                fontWeight="bold"
              >
                {calories}
              </SvgText>
              <SvgText
                x={center}
                y={center + 15}
                textAnchor="middle"
                fontSize="12"
              >
                kcal
              </SvgText>
            </G>
          </Svg>
        </View>
        
        <View style={styles.legendContainer}>
          <View style={styles.legendColumn}>
            <Text style={[styles.percentageText, { color: '#F3B353' }]}>
              {total > 0 ? Math.round(proteinPercentage * 100) : 0}%
            </Text>
            <Text style={styles.macroAmount}>{protein}g</Text>
            <Text style={styles.macroText}>Protein</Text>
          </View>
          
          <View style={styles.legendColumn}>
            <Text style={[styles.percentageText, { color: '#5CB4B0' }]}>
              {total > 0 ? Math.round(carbsPercentage * 100) : 0}%
            </Text>
            <Text style={styles.macroAmount}>{carbs}g</Text>
            <Text style={styles.macroText}>Carbs</Text>
          </View>
          
          <View style={styles.legendColumn}>
            <Text style={[styles.percentageText, { color: '#FF3131' }]}>
              {total > 0 ? Math.round(fatPercentage * 100) : 0}%
            </Text>
            <Text style={styles.macroAmount}>{fat}g</Text>
            <Text style={styles.macroText}>Fat</Text>
          </View>
        </View>
      </View>
    </View>
  );  
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 0,
  },
  pieContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: -30,
  },
  legendContainer: {
    flex: 1.2,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  legendColumn: {
    alignItems: 'center',
    paddingHorizontal: 2,
  },
  percentageText: {
    fontWeight: 'bold',
    fontSize: 14,
    marginBottom: 2,
  },
  macroAmount: {
    fontSize: 14,
    fontWeight: 'bold',
    color: 'black',
  },
  macroText: {
    fontSize: 12,
    color: 'black',
  }
});
