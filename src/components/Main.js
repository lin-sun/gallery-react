require('normalize.css/normalize.css');
require('styles/App.scss');

import React from 'react';
import ReactDOM from 'react-dom'
//获取图片相关的数据
var imgData = require('../data/imgData.json');

// 给图片数据添加地址
imgData=(function getImgDataUrl(array) {
  for(var i=0;i<array.length;i++){
    var fileName=array[i].fileName;
    array[i].imgUrl=require('../images/'+fileName);
  }
  return array;
})(imgData);

/* 获取一个区域间的随机数
*/

var randomNumber = function(min,man){
  return Math.floor(Math.random() * (man - min)) +　min;
};

var randomDeg = function  () {
  return (Math.random()<0.5?'-':'') + Math.floor(Math.random() * 45);
}

//图片组件
class ImageModule extends React.Component{
  constructor(props){
    super(props);
    this.handClick = this.handClick.bind(this)
  }
// 鼠标点击两种状态
  handClick(e){
    if(!this.props.imgFiguresState.isCenter){
      this.props.centerImgs();
    }else{
      this.props.reverseImgs();
    }
    e.preventDefault();
    e.stopPropagation();
  }
  render(){
    var img = this.props.data,
    styleObj = {},
    imgState = this.props.imgFiguresState,
    imgClassName = '';
    if(imgState.pos){
      styleObj=imgState.pos;
    }
    if(imgState.rotate){
      ['Moz','Ms','WebKit',''].forEach(function  (value,index) {
        styleObj[value + 'transform'] = 'rotate(' + imgState.rotate + 'deg)';
      })
    }
    imgState.isCenter?styleObj['zIndex'] = 111:'';

    imgClassName += imgState.isCenter?' is-center':'';
    imgClassName += imgState.isReverse?' is-reverse':'';

    return (
      <figure className={imgClassName} style = {styleObj} onClick = {this.handClick}>
      <img src={img.imgUrl} alt={img.title}/>
      <figcaption>
      <span className="img-title">{img.title}</span>
      <div className="img-desc"><p>{img.desc}</p></div>
      </figcaption>
      </figure>
    )
  }
}
// 控制组件
class ControlModule extends React.Component {
  constructor(props){
    super(props);
    this.handClick = this.handClick.bind(this)
  }

  handClick(e){
    if(!this.props.imgFiguresState.isCenter){
      this.props.centerImgs();
    }else{
      this.props.reverseImgs();
    }
    e.stopPropagation();
    e.preventDefault();
  }
  render() {
    var imgState = this.props.imgFiguresState,
      spanClassName='';
      spanClassName += imgState.isCenter?' is-center':'';
      spanClassName += imgState.isReverse?' is-reverse':'';
    return (
      <span className = {spanClassName} onClick = {this.handClick}></span>
    )
  }
}


class gallery extends React.Component {

  constructor(props){
    super(props);

    this.state = {
      stateImgs:[]
    };

    this.stateRange={
      centerPos:{
        left:0,
        right:0
      },
      bothSidesPos:{
        leftRange:[0,0],
        rightRange:[0,0],
        visRange:[0,0]
      },
      topSidesPos:{
        left:[0,0],
        top:[0,0]
      }
    };
  }

  renderImgs(centerIndex){
    var stateImgs = this.state.stateImgs,
    stateRange = this.stateRange,
    centerPos = stateRange.centerPos,
    topSidesPos = stateRange.topSidesPos,
    bothSidesPos = stateRange.bothSidesPos;

    // 让centerIndex的图片居中
    var centerImgs=stateImgs.splice(centerIndex,1);
    centerImgs[0]= {
      pos : centerPos,
      rotate:0,
      isCenter:true,
      isReverse:false
    }

    // 顶部图片取一个或者不取
    var topImgNum=Math.floor(Math.random() * 2),
    topImgIndex=Math.floor(Math.random() * (stateImgs.length - topImgNum)),
    topImgs=null;
    if(topImgNum){
      topImgs=stateImgs.splice(topImgIndex,topImgNum);
      topImgs[0]={
        pos:{
          left:randomNumber(topSidesPos.left[0],topSidesPos.left[1]),
          top:randomNumber(topSidesPos.top[0],topSidesPos.top[1])
        },
        rotate:randomDeg(),
        isCenter:false,
        isReverse:false
      }
    }

    //  布局两端的图片，一半在左，一半在右
    for ( var i = 0,j = stateImgs.length; i < j; i++){
      //  判断布局左右
      var bothLeft = null;
      if(i < j / 2){
        bothLeft = bothSidesPos.leftRange;
      }else{
        bothLeft = bothSidesPos.rightRange;
      }
      stateImgs[i] = {
        pos:{
          left:randomNumber(bothLeft[0],bothLeft[1]),
          top:randomNumber(bothSidesPos.visRange[0],bothSidesPos.visRange[1])
        },
        rotate:randomDeg(),
        isCenter:false,
        isReverse:false
      };
    }

    //  合并状态数组 先splice topimgs,在splice centerImgs 不能颠倒顺序， 因为会改变Index的值
    if(topImgNum){
      stateImgs.splice(topImgIndex,0,topImgs[0]);
    }
    stateImgs.splice(centerIndex,0,centerImgs[0]);
    this.setState({
      stateImgs : stateImgs
    })
  }
  // es6 return 一个函数 （）=>｛｝写法  （）｛｝会报错
  centerImgs(index) {
    return () => {
      this.renderImgs(index);
    }
  }

  reverseImgs(index){
    return () => {
      var stateImgs = this.state.stateImgs;
      stateImgs[index].isReverse = !stateImgs[index].isReverse;

      this.setState({
        stateImgs : stateImgs
      })
    }
  }

  componentDidMount(){
    //  获取舞台的大小和一半
    var stage = ReactDOM.findDOMNode(this.refs.stage),
    stageW = stage.scrollWidth,
    stageH = stage.scrollHeight,
    halfStageH = Math.floor(stageH / 2),
    halfStageW = Math.floor(stageW / 2);
    //  获取图片的大小和一半
    var imgs = ReactDOM.findDOMNode(this.refs.imgs0),
    imgsH = imgs.scrollHeight,
    imgsW = imgs.scrollWidth,
    halfImgsH = Math.floor(imgsH / 2),
    halfImgsW = Math.floor(imgsW / 2);

    // 给stateRange赋值
    this.stateRange.centerPos　= {
      left:halfStageW - halfImgsW,
      top: halfStageH - halfImgsH
    }

    this.stateRange.bothSidesPos = {
      leftRange:[-halfImgsW,halfStageW - halfImgsW * 3],
      rightRange:[halfStageW + halfImgsH,stageW - halfImgsW],
      visRange: [-halfImgsH,stageH - halfImgsH]
    }

    this.stateRange.topSidesPos = {
      left:[halfStageW - halfImgsW *　3,halfStageW + halfImgsW * 3],
      top:[-halfImgsH,halfStageH - halfImgsH * 3]
    }

    var num=Math.floor(Math.random()*imgData.length);
    this.renderImgs(num);
  }

  render() {
    var imgFigures=[];
    var navLists=[];

    //遍历数据，将图片插入到页面中
    imgData.forEach(function(value,index){
      if(!this.state.stateImgs[index]){
        this.state.stateImgs.push({
          pos:{
            left:0,
            top:0
          },
          rotate:0,
          isCenter:false,
          isReverse:false
        });
      }
      imgFigures.push(<ImageModule data={value} imgFiguresState={this.state.stateImgs[index]} reverseImgs={this.reverseImgs(index)} centerImgs={this.centerImgs(index)} ref={'imgs'+index}/>)
      navLists.push(<ControlModule imgFiguresState={this.state.stateImgs[index]} reverseImgs={this.reverseImgs(index)} centerImgs={this.centerImgs(index)}/>)
    }.bind(this))

    return (
      <div className="gallery" ref="stage">
      <section className="img-sec">
      {imgFigures}
      </section>
      <nav className="controller-nav">
      {navLists}
      </nav>
      </div>
    );
  }
}

gallery.defaultProps = {

};

export default gallery;
