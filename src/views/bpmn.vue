<template>
  <div class="bpmn-con">
  <!-- 把操作按钮写在这里面 -->
    <div class="action">
      <el-upload action class="upload-demo" :before-upload="openBpmn">
        <el-button icon="el-icon-folder-opened" type="primary" size="mini"></el-button>
      </el-upload>
      <el-button class="new" icon="el-icon-circle-plus" @click="newDiagram" type="primary" size="mini"></el-button>
      <!-- <el-button icon="el-icon-download" @click="downloadBpmn"></el-button>
      <el-button icon="el-icon-picture" @click="downloadSvg"></el-button>
      <a hidden ref="downloadLink"></a> -->
      <el-tooltip effect="light">
          <div slot="content">
            <el-button type="text" @click="downloadProcessAsXml()">下载为XML文件</el-button>
            <br />
            <el-button type="text" @click="downloadProcessAsSvg()">下载为SVG文件</el-button>
            <br />
            <el-button type="text" @click="downloadProcessAsBpmn()">下载为BPMN文件</el-button>
          </div>
          <el-button type="primary" icon="el-icon-download" size="mini">下载文件</el-button>
        </el-tooltip>
      
      <el-button-group key="align-control">
        <el-tooltip effect="light" content="向左对齐">
          <el-button size="mini" class="align align-left" icon="el-icon-s-data" @click="elementsAlign('left')" />
        </el-tooltip>
        <el-tooltip effect="light" content="向右对齐">
          <el-button size="mini" class="align align-right" icon="el-icon-s-data" @click="elementsAlign('right')" />
        </el-tooltip>
        <el-tooltip effect="light" content="向上对齐">
          <el-button size="mini" class="align align-top" icon="el-icon-s-data" @click="elementsAlign('top')" />
        </el-tooltip>
        <el-tooltip effect="light" content="向下对齐">
          <el-button size="mini" class="align align-bottom" icon="el-icon-s-data" @click="elementsAlign('bottom')" />
        </el-tooltip>
        <el-tooltip effect="light" content="水平居中">
          <el-button size="mini" class="align align-center" icon="el-icon-s-data" @click="elementsAlign('center')" />
        </el-tooltip>
        <el-tooltip effect="light" content="垂直居中">
          <el-button size="mini" class="align align-middle" icon="el-icon-s-data" @click="elementsAlign('middle')" />
        </el-tooltip>
      </el-button-group>
    </div>
    <div class="container">
      <!-- 创建一个canvas画布 npmn-js是通过canvas实现绘图的，并设置ref让vue获取到element -->
      <div class="bpmn-container">
        <div class="bpmn-canvas" ref="canvas"></div>
        <!-- 工具栏显示的地方 -->
        <div class="bpmn-js-properties-panel" id="js-properties-panel"></div>
      </div>

      
    </div>
  </div>
</template>

<script>
import BpmnModeler from "bpmn-js/lib/Modeler";
// 工具栏相关
import propertiesProviderModule from "bpmn-js-properties-panel/lib/provider/camunda";
import propertiesPanelModule from "bpmn-js-properties-panel";
// import camundaModdleDescriptor from "camunda-bpmn-moddle/resources/camunda";

// 汉化
import customTranslate from "../components/bpmn/translate/customTranslate";
import customPaletteModule from '../components/bpmn/palette/index'

export default {
  data() {
    return {
      bpmnModeler: null,
      canvas: null,
      bpmnTemplate: `
          <?xml version="1.0" encoding="UTF-8"?>
          <definitions 
              xmlns="http://www.omg.org/spec/BPMN/20100524/MODEL" 
              xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" 
              xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" 
              xmlns:omgdc="http://www.omg.org/spec/DD/20100524/DC" 
              xmlns:camunda="http://camunda.org/schema/1.0/bpmn" 
              xmlns:xsd="http://www.w3.org/2001/XMLSchema" 
              xmlns:activiti="http://activiti.org/bpmn" 
              id="m1577635100724" 
              name="" 
              targetNamespace="http://www.activiti.org/testm1577635100724"
            >
            <process id="process" processType="None" isClosed="false" isExecutable="true">
              <extensionElements>
                <camunda:properties>
                  <camunda:property name="a" value="1" />
                </camunda:properties>
              </extensionElements>
              <startEvent id="_2" name="start" />
            </process>
            <bpmndi:BPMNDiagram id="BPMNDiagram_leave">
              <bpmndi:BPMNPlane id="BPMNPlane_leave" bpmnElement="leave">
                <bpmndi:BPMNShape id="BPMNShape__2" bpmnElement="_2">
                  <omgdc:Bounds x="144" y="368" width="32" height="32" />
                  <bpmndi:BPMNLabel>
                    <omgdc:Bounds x="149" y="400" width="23" height="14" />
                  </bpmndi:BPMNLabel>
                </bpmndi:BPMNShape>
              </bpmndi:BPMNPlane>
            </bpmndi:BPMNDiagram>
          </definitions>
      `,
      events:["element.click"]
    };
  },
  mounted() {
    this.init();
  },
  methods: {
    async init() {
      // 获取画布 element
      this.canvas = this.$refs.canvas;

      // 将汉化包装成一个模块
      const customTranslateModule = {
        translate: ["value", customTranslate]
      };

      // 创建Bpmn对象
      this.bpmnModeler = new BpmnModeler({
        // 设置bpmn的绘图容器为上门获取的画布 element
        container: this.canvas,

        // 加入工具栏支持
        propertiesPanel: {
          parent: "#js-properties-panel"
        },
        additionalModules: [
          // 工具栏模块
          propertiesProviderModule,
          propertiesPanelModule,
          // 汉化模块
          customTranslateModule,
          //用户自定义左侧图形栏
          customPaletteModule
        ],
        moddleExtensions: {
        //   camunda: camundaModdleDescriptor
        }
      });
      this.initModelListeners()
      await this.createNewDiagram(this.bpmnTemplate);
    },
    async createNewDiagram(bpmn) {
      // 将字符串转换成图显示出来;
      this.bpmnModeler.importXML(bpmn, err => {
        if (err) {
          console.error("打开模型出错,请确认该模型符合Bpmn2.0规范");
        }
      });
    },
    initModelListeners() {
      const EventBus = this.bpmnModeler.get("eventBus");
      const that = this;
      // 监听图形改变返回xml
      EventBus.on("commandStack.changed", async event => {
        try {
          this.recoverable = this.bpmnModeler.get("commandStack").canRedo();
          this.revocable = this.bpmnModeler.get("commandStack").canUndo();
          let { xml } = await this.bpmnModeler.saveXML({ format: true });
          this.$emit("commandStack-changed", event);
          this.$emit("input", xml);
          this.$emit("change", xml);
        } catch (e) {
          console.error(`[Process Designer Warn]: ${e.message || e}`);
        }
      });
      EventBus.on("element.click", async event => {
        console.log('元素点击',event)
        var elementToColor = this.bpmnModeler.get('elementRegistry').get(event.element.id); 
        var modeling = this.bpmnModeler.get('modeling');
        modeling.setColor([elementToColor], { 
          stroke: 'green',
          fill: 'yellow'
        });
      });
      // 监听视图缩放变化
      this.bpmnModeler.on("canvas.viewbox.changed", ({ viewbox }) => {
        this.$emit("canvas-viewbox-changed", { viewbox });
        const { scale } = viewbox;
        this.defaultZoom = Math.floor(scale * 100) / 100;
      });
    },
    newDiagram() {
      this.createNewDiagram(this.bpmnTemplate);
    },

    downloadBpmn() {
      this.bpmnModeler.saveXML({ format: true }, (err, xml) => {
        if (!err) {
          // 获取文件名
          const name = `${this.getFilename(xml)}.bpmn`;
          // 将文件名以及数据交给下载方法
          this.download({ name: name, data: xml });
        }
      });
    },
    downloadSvg() {
      this.bpmnModeler.saveXML({ format: true }, (err, xml) => {
        if (!err) {
          // 获取文件名
          const name = `${this.getFilename(xml)}.svg`;

          // 从建模器画布中提取svg图形标签
          let context = "";
          const djsGroupAll = this.$refs.canvas.querySelectorAll(".djs-group");
          for (let item of djsGroupAll) {
            context += item.innerHTML;
          }
          // 获取svg的基本数据，长宽高
          const viewport = this.$refs.canvas
            .querySelector(".viewport")
            .getBBox();

          // 将标签和数据拼接成一个完整正常的svg图形
          const svg = `
            <svg
              xmlns="http://www.w3.org/2000/svg"
              xmlns:xlink="http://www.w3.org/1999/xlink"
              width="${viewport.width}"
              height="${viewport.height}"
              viewBox="${viewport.x} ${viewport.y} ${viewport.width} ${viewport.height}"
              version="1.1"
              >
              ${context}
            </svg>
          `;
          // 将文件名以及数据交给下载方法
          this.download({ name: name, data: svg });
        }
      });
    },
    downloadProcessAsXml() {
      this.downloadProcess("xml");
    },
    downloadProcessAsBpmn() {
      this.downloadProcess("bpmn");
    },
    downloadProcessAsSvg() {
      this.downloadProcess("svg");
    },
    // 下载流程图到本地
    async downloadProcess(type, name) {
      try {
        const _this = this;
        // 按需要类型创建文件并下载
        if (type === "xml" || type === "bpmn") {
          const { err, xml } = await this.bpmnModeler.saveXML();
          // 读取异常时抛出异常
          if (err) {
            console.error(`[Process Designer Warn ]: ${err.message || err}`);
          }
          let { href, filename } = _this.setEncoded(type.toUpperCase(), name, xml);
          downloadFunc(href, filename);
        } else {
          const { err, svg } = await this.bpmnModeler.saveSVG();
          // 读取异常时抛出异常
          if (err) {
            return console.error(err);
          }
          let { href, filename } = _this.setEncoded("SVG", name, svg);
          downloadFunc(href, filename);
        }
      } catch (e) {
        console.error(`[Process Designer Warn ]: ${e.message || e}`);
      }
      // 文件下载方法
      function downloadFunc(href, filename) {
        if (href && filename) {
          let a = document.createElement("a");
          a.download = filename; //指定下载的文件名
          a.href = href; //  URL对象
          a.click(); // 模拟点击
          URL.revokeObjectURL(a.href); // 释放URL 对象
        }
      }
    },

    // 根据所需类型进行转码并返回下载地址
    setEncoded(type, filename = "diagram", data) {
      const encodedData = encodeURIComponent(data);
      return {
        filename: `${filename}.${type}`,
        href: `data:application/${type === "svg" ? "text/xml" : "bpmn20-xml"};charset=UTF-8,${encodedData}`,
        data: data
      };
    },
    openBpmn(file) {
      const reader = new FileReader();
      // 读取File对象中的文本信息，编码格式为UTF-8
      reader.readAsText(file, "utf-8");
      reader.onload = () => {
        //读取完毕后将文本信息导入到Bpmn建模器
        this.createNewDiagram(reader.result);
      };
      return false;
    },

    getFilename(xml) {
      let start = xml.indexOf("process");
      let filename = xml.substr(start, xml.indexOf(">"));
      filename = filename.substr(filename.indexOf("id") + 4);
      filename = filename.substr(0, filename.indexOf('"'));
      return filename;
    },

    download({ name = "diagram.bpmn", data }) {
      // 这里就获取到了之前设置的隐藏链接
      const downloadLink = this.$refs.downloadLink;
      // 把数据转换为URI，下载要用到的
      const encodedData = encodeURIComponent(data);

      if (data) {
        // 将数据给到链接
        downloadLink.href =
          "data:application/bpmn20-xml;charset=UTF-8," + encodedData;
        // 设置文件名
        downloadLink.download = name;
        // 触发点击事件开始下载
        downloadLink.click();
      }
    },
    //对齐
    elementsAlign(align) {
      const Align = this.bpmnModeler.get("alignElements");
      const Selection = this.bpmnModeler.get("selection");
      const SelectedElements = Selection.get();
      if (!SelectedElements || SelectedElements.length <= 1) {
        this.$message.warning("请按住 Ctrl 键选择多个元素对齐");
        return;
      }
      this.$confirm("自动对齐可能造成图形变形，是否继续？", "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }).then(() => Align.trigger(SelectedElements, align));
    },
    
  },
 
};
</script>

<style scoped>
.bpmn-con{

}
.bpmn-container {
  width: 100%;
  height: 100vh;
  display: flex;
}

.bpmn-canvas {
  width: calc(100% - 300px);
  height: 100vh;
}

.bpmn-js-properties-panel {
  width: 320px;
  height: inherit;
  overflow-y: auto;
}

.action {
  width: 100%;
  display: flex;
  min-height: 40px;
  
}
/* // .align.align-left i {
  //     transform: rotate(90deg);
  //   }
  //   .align.align-right i {
  //     transform: rotate(-90deg);
  //   }
  //   .align.align-top i {
  //     transform: rotate(180deg);
  //   }
  //   .align.align-bottom i {
  //     transform: rotate(0deg);
  //   }
  //   .align.align-center i {
  //     transform: rotate(90deg);
  //     &:after {
  //       transform: rotate(90deg) translate(0, 60%);
  //     }
  //   }
  //   .align.align-middle i {
  //     transform: rotate(0deg);
  //     &:after {
  //       transform: rotate(90deg) translate(0, 60%);
  //     }
  //   } */
.upload-demo {
  margin-right: 10px;
}
</style>