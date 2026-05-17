import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

/**
 * StatusBadge Component
 * เป็นคอมโพเนนต์สำหรับแสดงสถานะต่างๆ (เช่น อนุมัติ, รออนุมัติ, ปฏิเสธ)
 * สามารถนำไปใช้งานในหน้ารายงาน (Report) เพื่อแสดงความสามารถในการทำ Reusable Component 
 * โดยสามารถปรับเปลี่ยนสีพื้นหลังและสีข้อความได้อัตโนมัติจาก status ที่ส่งเข้ามา
 */
export default function StatusBadge({ status, text }) {
  // ฟังก์ชันคำนวณสีตาม Status
  const getColors = () => {
    switch(status?.toLowerCase()) {
      case 'success': 
      case 'approved':
        return { bg: '#D1FAE5', text: '#065F46' }; // เขียว
      case 'warning': 
      case 'pending':
        return { bg: '#FEF3C7', text: '#92400E' }; // เหลืองส้ม
      case 'danger': 
      case 'rejected':
      case 'banned':
        return { bg: '#FEE2E2', text: '#991B1B' }; // แดง
      case 'info':
        return { bg: '#DBEAFE', text: '#1E40AF' }; // ฟ้า
      case 'hot':
        return { bg: '#FFE4E6', text: '#E11D48' }; // ชมพูเข้ม
      default: 
        return { bg: '#F3F4F6', text: '#374151' }; // เทา (ค่าเริ่มต้น)
    }
  };

  const colors = getColors();
  return (
    <View style={[styles.badgeContainer, { backgroundColor: colors.bg }]}>
      <Text style={[styles.badgeText, { color: colors.text }]}>{text || status}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badgeContainer: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: 'flex-start', // ทำให้ขนาดกล่องพอดีกับข้อความ
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'uppercase', // ทำให้ตัวอักษรเป็นพิมพ์ใหญ่เพื่อให้ดูเหมือน Badge
  }
});
