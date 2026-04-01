// stores/compare.js
import { defineStore } from 'pinia'

export const useCompareStore = defineStore('compare', {
  state: () => ({
    // Tự động lấy dữ liệu từ localStorage nếu có
    compareList: JSON.parse(localStorage.getItem('compareList')) || []
  }),
  actions: {
    addToCompare(product) {
      // 1. Kiểm tra sản phẩm đã tồn tại chưa
      const exists = this.compareList.find(p => p.id === product.id)
      if (exists) {
        alert("Sản phẩm này đã có trong danh sách so sánh!")
        return
      }

      // 2. Kiểm tra giới hạn 4 sản phẩm
      if (this.compareList.length >= 4) {
        alert("Bạn chỉ có thể so sánh tối đa 4 sản phẩm!")
        return
      }

      // 3. Thêm vào danh sách
      this.compareList.push(product)
      
      // 4. Lưu vào localStorage
      localStorage.setItem('compareList', JSON.stringify(this.compareList))
    },

    removeFromCompare(productId) {
      this.compareList = this.compareList.filter(p => p.id !== productId)
      localStorage.setItem('compareList', JSON.stringify(this.compareList))
    },

    clearCompare() {
      this.compareList = []
      localStorage.removeItem('compareList')
    }
  }
})