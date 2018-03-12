import React from 'react'
import { Divider, Card, Button} from 'antd'
import { Link } from 'react-router-dom'
import moment from 'moment'
import { Base64 } from 'js-base64'
import mermaid from 'mermaid'

class Preview extends React.Component {
  constructor (props) {
    super(props)
    this.onDownloadSVG = this.onDownloadSVG.bind(this)
    this.onDownloadPNG = this.onDownloadPNG.bind(this)
  }

  onDownloadSVG (event) {
    event.target.href = `data:image/svg+xml;base64,${Base64.encode(this.container.innerHTML)}`
    event.target.download = `mermaid-diagram-${moment().format('YYYYMMDDHHmmss')}.svg`
  }

  onDownloadPNG (event) {
    event.preventDefault();
    const svg = document.querySelector("svg");
    const imgsrc = 'data:image/svg+xml;base64,' + Base64.encode(this.container.innerHTML);
    const canvas = document.querySelector("canvas");
    
    canvas.setAttribute('width', svg.width.baseVal.value);
    canvas.setAttribute('height', svg.height.baseVal.value);
    const context = canvas.getContext("2d");
    
    const image = new Image;
    image.src = imgsrc;
    image.onload = function () {
      context.drawImage(image, 0, 0);
      const link = document.createElement('a');

      link.setAttribute('download', `mermaid-diagram-${moment().format('YYYYMMDDHHmmss')}.png`);
      link.setAttribute('href', canvas.toDataURL("image/png").replace("image/png", "image/octet-stream"));
      link.click();
    };
  }

  render () {
    const { code, match: { url }, location: { search } } = this.props
    return <div>
      <Card title='Preview'>
        <div ref={div => { this.container = div }}>{code}</div>
        <canvas style={{display: "none"}}></canvas>
      </Card>
      <Card title='Actions'>
        <div className='links'>
          <Link to={url.replace('/edit/', '/view/') + search}>Link to View</Link>
          <Divider type='vertical' />
          <a href='' download='' onClick={this.onDownloadSVG}>Download SVG</a>
          <Divider type='vertical' />
          <a href='' download='' onClick={this.onDownloadPNG}>Download PNG</a>
        </div>
      </Card>
    </div>
  }

  initMermaid () {
    const { code, history, match: { url } } = this.props
    try {
      mermaid.parse(code)
      mermaid.init(undefined, this.container)
    } catch ({str, hash}) {
      const base64 = Base64.encodeURI(str)
      history.push(`${url}/error/${base64}`)
    }
  }

  componentDidMount () {
    this.initMermaid()
  }

  componentDidUpdate () {
    this.container.removeAttribute('data-processed')
    this.container.innerHTML = this.props.code
    this.initMermaid()
  }
}

export default Preview
