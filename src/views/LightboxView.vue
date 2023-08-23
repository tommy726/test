<template>
  <div>
    <img
      @click="showSingle"
      src="../assets/images/image1.jpg"
      class="img-fluid rounded-top img-hover"
    />

    <img
      @click="showMultiple(0)"
      src="../assets/images/image2.jpg"
      class="img-fluid rounded-top img-hover"
    />
    <img
      @click="showMultiple(1)"
      src="../assets/images/image3.jpg"
      class="img-fluid rounded-top img-hover"
    />
    <vue-easy-lightbox
      :visible="visibleRef"
      :imgs="imgsRef"
      :index="indexRef"
      @hide="onHide"
      class="position-absolute"
    />
  </div>
</template>

<script>
import VueEasyLightbox from "vue-easy-lightbox";
import { ref, defineComponent } from "vue";
import image1 from "@/assets/images/image1.jpg";
import image2 from "@/assets/images/image2.jpg";
import image3 from "@/assets/images/image3.jpg";

export default defineComponent({
  components: {
    VueEasyLightbox,
  },
  setup() {
    const visibleRef = ref(false);
    const indexRef = ref(0); // default 0
    const imgsRef = ref([]);
    // Img Url , string or Array of string
    // ImgObj { src: '', title: '', alt: '' }
    // 'src' 是必须值
    // 允许混合

    const onShow = () => {
      visibleRef.value = true;
    };
    const showSingle = () => {
      imgsRef.value = image1;
      // or
      // imgsRef.value = {
      //   title: "蠟筆小新",
      //   src: image1,
      // };
      onShow();
    };
    const showMultiple = (index) => {
      // imgsRef.value = [image1, image2];
      // or
      imgsRef.value = [{ title: "凶手只有一個", src: image2 }, image3];
      indexRef.value = index; // 图片顺序索引
      onShow();
    };
    const onHide = () => (visibleRef.value = false);

    return {
      visibleRef,
      indexRef,
      imgsRef,
      showSingle,
      showMultiple,
      onHide,
    };
  },
});
</script>

<style lang="scss">
@media (min-width: 767px) {
  .vel-btns-wrapper .btn__prev {
    left: 20%;
  }
  .vel-btns-wrapper .btn__next {
    right: 20%;
  }
}
.img-hover {
  cursor: pointer;
}
</style>
