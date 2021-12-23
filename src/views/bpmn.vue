<template>
  <div class="bpmn-con">
  <!-- 把操作按钮写在这里面 -->
    <div class="action">
      <el-button-group key="file-control">
        <el-button size="mini" type="primary" icon="el-icon-folder-opened" @click="$refs.refFile.click()">打开文件</el-button>
        <input type="file" id="files" ref="refFile" style="display: none" accept=".xml, .bpmn" @change="importLocalFile" />
        <el-tooltip effect="light">
          <div slot="content">
            <el-button size="mini" type="text" @click="downloadProcessAsXml()">下载为XML文件</el-button>
            <br />
            <el-button size="mini" type="text" @click="downloadProcessAsSvg()">下载为SVG文件</el-button>
            <br />
            <el-button size="mini" type="text" @click="downloadProcessAsBpmn()">下载为BPMN文件</el-button>
          </div>
          <el-button size="mini" type="primary" icon="el-icon-download">下载文件</el-button>
        </el-tooltip>
        <el-tooltip effect="light">
          <div slot="content">
            <el-button size="mini" type="text" @click="previewProcessXML">预览XML</el-button>
            <br />
            <el-button size="mini" type="text" @click="previewProcessJson">预览JSON</el-button>
          </div>
          <el-button size="mini" type="primary" icon="el-icon-view">预览</el-button>
        </el-tooltip>
      </el-button-group>
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
      <el-button-group key="scale-control">
          <el-tooltip effect="light" content="缩小视图">
            <el-button size="mini" :disabled="defaultZoom < 0.2" icon="el-icon-zoom-out" @click="processZoomOut()" />
          </el-tooltip>
          <el-button size="mini">{{ Math.floor(this.defaultZoom * 10 * 10) + "%" }}</el-button>
          <el-tooltip effect="light" content="放大视图">
            <el-button size="mini" :disabled="defaultZoom > 4" icon="el-icon-zoom-in" @click="processZoomIn()" />
          </el-tooltip>
          <el-tooltip effect="light" content="重置视图并居中">
            <el-button size="mini" icon="el-icon-c-scale-to-original" @click="processReZoom()" />
          </el-tooltip>
        </el-button-group>
        <el-button-group key="stack-control">
          <el-tooltip effect="light" content="撤销">
            <el-button size="mini" :disabled="!revocable" icon="el-icon-refresh-left" @click="processUndo()" />
          </el-tooltip>
          <el-tooltip effect="light" content="恢复">
            <el-button size="mini" :disabled="!recoverable" icon="el-icon-refresh-right" @click="processRedo()" />
          </el-tooltip>
          <el-tooltip effect="light" content="重新绘制">
            <el-button size="mini" icon="el-icon-refresh" @click="processRestart" />
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
    <el-dialog title="预览" width="60%" :visible.sync="previewModelVisible" append-to-body destroy-on-close>
      <highlightjs :language="previewType" :code="previewResult" />
    </el-dialog>
  </div>
</template>

<script>
import BpmnModeler from "bpmn-js/lib/Modeler";
// 工具栏相关
import propertiesProviderModule from "bpmn-js-properties-panel/lib/provider/camunda";
import propertiesPanelModule from "bpmn-js-properties-panel";
// import camundaModdleDescriptor from "camunda-bpmn-moddle/resources/camunda";
// import flowableModdleDescriptor from "../components/bpmn/descriptor/flowableDescriptor.json";
// 汉化
import customTranslate from "../components/bpmn/translate/customTranslate";
//自定义左侧工具栏
import customPaletteModule from '../components/bpmn/palette/index'
//默认模板
import DefaultEmptyXML from "../components/bpmn/defaultEmpty";
// 引入json转换与高亮
import convert from "xml-js";

export default {
  data() {
    return {
      bpmnModeler: null,
      canvas: null,
      bpmnTemplate: "",
      previewModelVisible: false,
      previewResult: "",
      previewType: "xml",
      defaultZoom:1,
      recoverable: false,
      revocable: false
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
          // camunda: camundaModdleDescriptor,
          // flowable : flowableModdleDescriptor
        }
      });
      this.initModelListeners()
      let newId = `Process_${new Date().getTime()}`;
      let newName = `业务流程_${new Date().getTime()}`;
      this.bpmnTemplate=DefaultEmptyXML(newId,newName,'flowable')
      await this.createNewDiagram(this.bpmnTemplate);
    },
    async createNewDiagram(bpmn) {
      // 将字符串转换成图显示出来;
      try {
        const result = await this.bpmnModeler.importXML(bpmn);
        const { warnings } = result;
        console.log(warnings);
      } catch (err) {
        console.log(err.message, err.warnings);
        console.error("打开模型出错,请确认该模型符合Bpmn2.0规范");

      }
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
    
    // 加载本地文件
    importLocalFile() {
      const that = this;
      const file = this.$refs.refFile.files[0];
      const reader = new FileReader();
      reader.readAsText(file);
      reader.onload = function() {
        let xmlStr = this.result;
        that.createNewDiagram(xmlStr);
      };
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
    previewProcessXML() {
      this.bpmnModeler.saveXML({ format: true }).then(({ xml }) => {
        this.previewResult = xml;
        this.previewType = "xml";
        this.previewModelVisible = true;
      });
    },
    previewProcessJson() {
      this.bpmnModeler.saveXML({ format: true }).then(({ xml }) => {
        this.previewResult = convert.xml2json(xml, { spaces: 2 });
        this.previewType = "json";
        this.previewModelVisible = true;
      });
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
    processRedo() {
      this.bpmnModeler.get("commandStack").redo();
    },
    processUndo() {
      this.bpmnModeler.get("commandStack").undo();
    },
    processZoomIn(zoomStep = 0.1) {
      let newZoom = Math.floor(this.defaultZoom * 100 + zoomStep * 100) / 100;
      if (newZoom > 4) {
        throw new Error("[Process Designer Warn ]: The zoom ratio cannot be greater than 4");
      }
      this.defaultZoom = newZoom;
      this.bpmnModeler.get("canvas").zoom(this.defaultZoom);
    },
    processZoomOut(zoomStep = 0.1) {
      let newZoom = Math.floor(this.defaultZoom * 100 - zoomStep * 100) / 100;
      if (newZoom < 0.2) {
        throw new Error("[Process Designer Warn ]: The zoom ratio cannot be less than 0.2");
      }
      this.defaultZoom = newZoom;
      this.bpmnModeler.get("canvas").zoom(this.defaultZoom);
    },
    processReZoom() {
      this.defaultZoom = 1;
      this.bpmnModeler.get("canvas").zoom("fit-viewport", "auto");
    },
    processRestart() {
      this.recoverable = false;
      this.revocable = false;
      let newId = `Process_${new Date().getTime()}`;
      let newName = `业务流程_${new Date().getTime()}`;
      this.bpmnTemplate=DefaultEmptyXML(newId,newName,'flowable')
      this.createNewDiagram(this.bpmnTemplate);
    },
  },
 
};
</script>
<style lang="scss">
.el-button-group {
      margin: 4px;
    }
.align {
      position: relative;
      i {
        &:after {
          content: "|";
          position: absolute;
          transform: rotate(90deg) translate(200%, 60%);
        }
      }
    }
.align.align-left i {
      transform: rotate(90deg);
    }
    .align.align-right i {
      transform: rotate(-90deg);
    }
    .align.align-top i {
      transform: rotate(180deg);
    }
    .align.align-bottom i {
      transform: rotate(0deg);
    }
    .align.align-center i {
      transform: rotate(90deg);
      &:after {
        transform: rotate(90deg) translate(0, 60%);
      }
    }
    .align.align-middle i {
      transform: rotate(0deg);
      &:after {
        transform: rotate(90deg) translate(0, 60%);
      }
    } 
</style>
<style scoped lang="scss">
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

.upload-demo {
  margin-right: 10px;
}
</style>