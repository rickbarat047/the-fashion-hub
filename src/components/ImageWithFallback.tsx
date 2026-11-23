import React, { useState, useEffect } from "react";

interface ImageWithFallbackProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  fallbackText?: string;
  aspectRatioClass?: string;
  containerClassName?: string;
}

// Map remote Meesho images to local mirror paths if network/CORS fails in any client environment
const LOCAL_MIRROR_MAP: Record<string, string> = {
  // Product 1
  "https://images.meesho.com/images/products/539819444/bcruu_512.webp?width=1024":
    "/products/kurti-001/product-1-main.webp",
  "https://images.meesho.com/images/products/539819444/gvfcp_512.webp?width=1024":
    "/products/kurti-001/product-1-2.webp",
  "https://images.meesho.com/images/products/539819444/tag4b_512.webp?width=1024":
    "/products/kurti-001/product-1-3.webp",
  "https://images.meesho.com/images/products/539819444/omldu_512.webp?width=1024":
    "/products/kurti-001/product-1-4.webp",

  // Product 2
  "https://images.meesho.com/images/products/423040500/bbb7c_512.webp?width=1024":
    "/products/kurti-002/product-2-main.webp",
  "https://images.meesho.com/images/products/423040500/jq5ff_512.webp?width=1024":
    "/products/kurti-002/product-2-2.webp",
  "https://images.meesho.com/images/products/423040500/rikrn_512.webp?width=1024":
    "/products/kurti-002/product-2-3.webp",
  "https://images.meesho.com/images/products/423040500/u8ybe_512.webp?width=1024":
    "/products/kurti-002/product-2-4.webp",

  // Product 3
  "https://images.meesho.com/images/products/1049948196/9yqd5_512.webp?width=1024":
    "/products/kurti-003/product-3-main.webp",
  "https://images.meesho.com/images/products/1049948196/gw2dy_512.webp?width=1024":
    "/products/kurti-003/product-3-2.webp",
  "https://images.meesho.com/images/products/1049948196/de3tf_512.webp?width=1024":
    "/products/kurti-003/product-3-3.webp",
  "https://images.meesho.com/images/products/1049948196/xetp6_512.webp?width=1024":
    "/products/kurti-003/product-3-4.webp",

  // Product 4
  "https://images.meesho.com/images/products/495407917/6lpng_512.webp?width=1024":
    "/products/kurti-004/product-4-main.webp",
  "https://images.meesho.com/images/products/495407917/tccfc_512.webp?width=1024":
    "/products/kurti-004/product-4-2.webp",
  "https://images.meesho.com/images/products/495407917/2tfps_512.webp?width=1024":
    "/products/kurti-004/product-4-3.webp",
  "https://images.meesho.com/images/products/495407917/obbmd_512.webp?width=1024":
    "/products/kurti-004/product-4-4.webp",

  // Product 5
  "https://images.meesho.com/images/products/1105951833/cxwt2.jpg":
    "/products/kurti-005/product-5-main.jpg",
  "https://images.meesho.com/images/products/1105951833/28la7.jpg":
    "/products/kurti-005/product-5-2.jpg",
  "https://images.meesho.com/images/products/1105951833/5af7h.jpg":
    "/products/kurti-005/product-5-3.jpg",
  "https://images.meesho.com/images/products/1105951833/dmjno.jpg":
    "/products/kurti-005/product-5-4.jpg",

  // Product 6
  "https://images.meesho.com/images/products/417397973/gtdak.jpg":
    "/products/kurti-006/product-6-main.jpg",
  "https://images.meesho.com/images/products/417397973/ojr96.jpg":
    "/products/kurti-006/product-6-2.jpg",
  "https://images.meesho.com/images/products/417397973/7n2qm.jpg":
    "/products/kurti-006/product-6-3.jpg",
  "https://images.meesho.com/images/products/417397973/irp5y.jpg":
    "/products/kurti-006/product-6-4.jpg",

  // Product 7
  "https://images.meesho.com/images/products/519415423/neof4.jpg":
    "/products/coord-007/product-7-main.jpg",
  "https://images.meesho.com/images/products/519415423/xktmt.jpg":
    "/products/coord-007/product-7-2.jpg",
  "https://images.meesho.com/images/products/519415423/dahn9.jpg":
    "/products/coord-007/product-7-3.jpg",
  "https://images.meesho.com/images/products/519415423/nswfr.jpg":
    "/products/coord-007/product-7-4.jpg",

  // Product 8
  "https://images.meesho.com/images/products/499279857/jalzh.jpg":
    "/products/kurti-008/product-8-main.jpg",
  "https://images.meesho.com/images/products/499279857/t0a9h.jpg":
    "/products/kurti-008/product-8-2.jpg",
  "https://images.meesho.com/images/products/499279857/lzuog.jpg":
    "/products/kurti-008/product-8-3.jpg",
  "https://images.meesho.com/images/products/499279857/nxhoe.jpg":
    "/products/kurti-008/product-8-4.jpg",

  // Product 9 (3 unique listing photos — seller duplicated the 4th slot)
  "https://images.meesho.com/images/products/646503124/luulm.jpg":
    "/products/kurti-009/product-9-main.jpg",
  "https://images.meesho.com/images/products/646503124/rwsoh.jpg":
    "/products/kurti-009/product-9-2.jpg",
  "https://images.meesho.com/images/products/646503124/uunfo.jpg":
    "/products/kurti-009/product-9-3.jpg",

  // Product 10 (3 unique listing photos — seller duplicated one slot)
  "https://images.meesho.com/images/products/1047999712/e7t93.jpg":
    "/products/kurti-010/product-10-main.jpg",
  "https://images.meesho.com/images/products/1047999712/icpky.jpg":
    "/products/kurti-010/product-10-2.jpg",
  "https://images.meesho.com/images/products/1047999712/ucuvi.jpg":
    "/products/kurti-010/product-10-4.jpg",

  // Product 11
  "https://images.meesho.com/images/products/1026362757/9jcqv.jpg":
    "/products/kurti-011/product-11-main.jpg",
  "https://images.meesho.com/images/products/1026362757/wc7or.jpg":
    "/products/kurti-011/product-11-2.jpg",
  "https://images.meesho.com/images/products/1026362757/ljxxy.jpg":
    "/products/kurti-011/product-11-3.jpg",
  "https://images.meesho.com/images/products/1026362757/n17ak.jpg":
    "/products/kurti-011/product-11-4.jpg",

  // Product 12
  "https://images.meesho.com/images/products/989057227/xghfg.jpg":
    "/products/kurti-012/product-12-main.jpg",
  "https://images.meesho.com/images/products/989057227/fqjrd.jpg":
    "/products/kurti-012/product-12-2.jpg",
  "https://images.meesho.com/images/products/989057227/mfcqk.jpg":
    "/products/kurti-012/product-12-3.jpg",

  // Product 13
  "https://images.meesho.com/images/products/1092599960/lfxy5.jpg":
    "/products/kurti-013/product-13-main.jpg",
  "https://images.meesho.com/images/products/1092599960/qlttf.jpg":
    "/products/kurti-013/product-13-2.jpg",
  "https://images.meesho.com/images/products/1092599960/a653q.jpg":
    "/products/kurti-013/product-13-3.jpg",
  "https://images.meesho.com/images/products/1092599960/2i2zy.jpg":
    "/products/kurti-013/product-13-4.jpg",

  // Product 14
  "https://images.meesho.com/images/products/1098820283/zfbah.jpg":
    "/products/kurti-014/product-14-main.jpg",
  "https://images.meesho.com/images/products/1098820283/punqq.jpg":
    "/products/kurti-014/product-14-2.jpg",
  "https://images.meesho.com/images/products/1098820283/xwivm.jpg":
    "/products/kurti-014/product-14-3.jpg",

  // Product 15
  "https://images.meesho.com/images/products/1071239231/p0ucw.jpg":
    "/products/kurti-015/product-15-main.jpg",
  "https://images.meesho.com/images/products/1071239231/cgzrr.jpg":
    "/products/kurti-015/product-15-2.jpg",
  "https://images.meesho.com/images/products/1071239231/erdlq.jpg":
    "/products/kurti-015/product-15-3.jpg",
  "https://images.meesho.com/images/products/1071239231/mndq4.jpg":
    "/products/kurti-015/product-15-4.jpg",

  // Product 16
  "https://images.meesho.com/images/products/705875792/w6iys.jpg":
    "/products/kurti-016/product-16-main.jpg",
  "https://images.meesho.com/images/products/705875792/8y2sc.jpg":
    "/products/kurti-016/product-16-2.jpg",
  "https://images.meesho.com/images/products/705875792/6m9vd.jpg":
    "/products/kurti-016/product-16-3.jpg",
  "https://images.meesho.com/images/products/705875792/herdu.jpg":
    "/products/kurti-016/product-16-4.jpg",

  // Product 17
  "https://images.meesho.com/images/products/1056291429/zxnog.jpg":
    "/products/kurti-017/product-17-main.jpg",
  "https://images.meesho.com/images/products/1056291429/ovw0e.jpg":
    "/products/kurti-017/product-17-2.jpg",
  "https://images.meesho.com/images/products/1056291429/2ur3u.jpg":
    "/products/kurti-017/product-17-3.jpg",
  "https://images.meesho.com/images/products/1056291429/hpibf.jpg":
    "/products/kurti-017/product-17-4.jpg",

  // Product 18
  "https://images.meesho.com/images/products/1016220210/bacua.jpg":
    "/products/kurti-018/product-18-main.jpg",
  "https://images.meesho.com/images/products/1016220210/mbwql.jpg":
    "/products/kurti-018/product-18-2.jpg",
  "https://images.meesho.com/images/products/1016220210/1guow.jpg":
    "/products/kurti-018/product-18-3.jpg",
  "https://images.meesho.com/images/products/1016220210/epwbv.jpg":
    "/products/kurti-018/product-18-4.jpg",

  // Product 19
  "https://images.meesho.com/images/products/889479467/byjjq.jpg":
    "/products/kurti-019/product-19-main.jpg",
  "https://images.meesho.com/images/products/889479467/eklc4.jpg":
    "/products/kurti-019/product-19-2.jpg",
  "https://images.meesho.com/images/products/889479467/qcziq.jpg":
    "/products/kurti-019/product-19-3.jpg",
  "https://images.meesho.com/images/products/889479467/9ociz.jpg":
    "/products/kurti-019/product-19-4.jpg",

  // Product 20 (3 listing photos)
  "https://images.meesho.com/images/products/1084128719/ssdzc.jpg":
    "/products/kurti-020/product-20-main.jpg",
  "https://images.meesho.com/images/products/1084128719/rjipk.jpg":
    "/products/kurti-020/product-20-2.jpg",
  "https://images.meesho.com/images/products/1084128719/jjpw3.jpg":
    "/products/kurti-020/product-20-3.jpg",

  // Product 21 (3 listing photos)
  "https://images.meesho.com/images/products/1060917211/arh3j.jpg":
    "/products/kurti-021/product-21-main.jpg",
  "https://images.meesho.com/images/products/1060917211/7unaq.jpg":
    "/products/kurti-021/product-21-2.jpg",
  "https://images.meesho.com/images/products/1060917211/ibraj.jpg":
    "/products/kurti-021/product-21-3.jpg",

  // Product 22 (3 listing photos)
  "https://images.meesho.com/images/products/1123108769/xllrt.jpg":
    "/products/kurti-022/product-22-main.jpg",
  "https://images.meesho.com/images/products/1123108769/gnknd.jpg":
    "/products/kurti-022/product-22-2.jpg",
  "https://images.meesho.com/images/products/1123108769/pgfnq.jpg":
    "/products/kurti-022/product-22-3.jpg",

  // Product 23 (4 listing photos)
  "https://images.meesho.com/images/products/1048837080/qynjd.jpg":
    "/products/kurti-023/product-23-main.jpg",
  "https://images.meesho.com/images/products/1048837080/7zgos.jpg":
    "/products/kurti-023/product-23-2.jpg",
  "https://images.meesho.com/images/products/1048837080/32n0w.jpg":
    "/products/kurti-023/product-23-3.jpg",
  "https://images.meesho.com/images/products/1048837080/ozfdk.jpg":
    "/products/kurti-023/product-23-4.jpg",

  // Product 24 (4 listing photos)
  "https://images.meesho.com/images/products/530603958/kyijn.jpg":
    "/products/kurti-024/product-24-main.jpg",
  "https://images.meesho.com/images/products/530603958/tmtiz.jpg":
    "/products/kurti-024/product-24-2.jpg",
  "https://images.meesho.com/images/products/530603958/xa7ev.jpg":
    "/products/kurti-024/product-24-3.jpg",
  "https://images.meesho.com/images/products/530603958/fnmib.jpg":
    "/products/kurti-024/product-24-4.jpg",

  // Product 25 (4 listing photos)
  "https://images.meesho.com/images/products/687058617/tlohw.jpg":
    "/products/kurti-025/product-25-main.jpg",
  "https://images.meesho.com/images/products/687058617/ckdq2.jpg":
    "/products/kurti-025/product-25-2.jpg",
  "https://images.meesho.com/images/products/687058617/deiws.jpg":
    "/products/kurti-025/product-25-3.jpg",
  "https://images.meesho.com/images/products/687058617/zdzwc.jpg":
    "/products/kurti-025/product-25-4.jpg",

  // Product 26 (4 listing photos)
  "https://images.meesho.com/images/products/757544728/tgd9n.jpg":
    "/products/kurti-026/product-26-main.jpg",
  "https://images.meesho.com/images/products/757544728/ydmer.jpg":
    "/products/kurti-026/product-26-2.jpg",
  "https://images.meesho.com/images/products/757544728/e2s1y.jpg":
    "/products/kurti-026/product-26-3.jpg",
  "https://images.meesho.com/images/products/757544728/dicx4.jpg":
    "/products/kurti-026/product-26-4.jpg",

  // Product 27 (3 listing photos)
  "https://images.meesho.com/images/products/1112165981/ohtxg.jpg":
    "/products/kurti-027/product-27-main.jpg",
  "https://images.meesho.com/images/products/1112165981/zkuxh.jpg":
    "/products/kurti-027/product-27-2.jpg",
  "https://images.meesho.com/images/products/1112165981/zma5g.jpg":
    "/products/kurti-027/product-27-3.jpg",

  // Product 28 (4 listing photos)
  "https://images.meesho.com/images/products/481244020/rse0w.jpg":
    "/products/kurti-028/product-28-main.jpg",
  "https://images.meesho.com/images/products/481244020/6sfcg.jpg":
    "/products/kurti-028/product-28-2.jpg",
  "https://images.meesho.com/images/products/481244020/lukwt.jpg":
    "/products/kurti-028/product-28-3.jpg",
  "https://images.meesho.com/images/products/481244020/kirxq.jpg":
    "/products/kurti-028/product-28-4.jpg",

  // Product 29 (1 listing photo)
  "https://images.meesho.com/images/products/435899553/9vr0k.jpg":
    "/products/kurti-029/product-29-main.jpg",

  // Product 30 (4 listing photos)
  "https://images.meesho.com/images/products/1076522502/1inbk.jpg":
    "/products/kurti-030/product-30-main.jpg",
  "https://images.meesho.com/images/products/1076522502/dspf6.jpg":
    "/products/kurti-030/product-30-2.jpg",
  "https://images.meesho.com/images/products/1076522502/ypnar.jpg":
    "/products/kurti-030/product-30-3.jpg",
  "https://images.meesho.com/images/products/1076522502/fhven.jpg":
    "/products/kurti-030/product-30-4.jpg",

  // Product 31 (1 listing photo)
  "https://images.meesho.com/images/products/985690990/9lqsw.jpg?width=1024":
    "/products/top-031/product-31-main.jpg",

  // Product 32 (4 listing photos)
  "https://images.meesho.com/images/products/428512663/d7ysb.jpg?width=1024":
    "/products/top-032/product-32-main.jpg",
  "https://images.meesho.com/images/products/428512663/28af2.jpg?width=1024":
    "/products/top-032/product-32-2.jpg",
  "https://images.meesho.com/images/products/428512663/6zgtx.jpg?width=1024":
    "/products/top-032/product-32-3.jpg",
  "https://images.meesho.com/images/products/428512663/gux5l.jpg?width=1024":
    "/products/top-032/product-32-4.jpg",

  // Product 33 (4 listing photos)
  "https://images.meesho.com/images/products/1009455923/6dbbo.jpg?width=1024":
    "/products/kurti-033/product-33-main.jpg",
  "https://images.meesho.com/images/products/1009455923/w8naf.jpg?width=1024":
    "/products/kurti-033/product-33-2.jpg",
  "https://images.meesho.com/images/products/1009455923/5dbxr.jpg?width=1024":
    "/products/kurti-033/product-33-3.jpg",
  "https://images.meesho.com/images/products/1009455923/l77zb.jpg?width=1024":
    "/products/kurti-033/product-33-4.jpg",

  // Product 34 (4 listing photos)
  "https://images.meesho.com/images/products/1095976457/nwe1k.jpg?width=1024":
    "/products/dress-034/product-34-main.jpg",
  "https://images.meesho.com/images/products/1095976457/txaqr.jpg?width=1024":
    "/products/dress-034/product-34-2.jpg",
  "https://images.meesho.com/images/products/1095976457/g4wxi.jpg?width=1024":
    "/products/dress-034/product-34-3.jpg",
  "https://images.meesho.com/images/products/1095976457/z8jml.jpg?width=1024":
    "/products/dress-034/product-34-4.jpg",

  // Product 35 (4 listing photos)
  "https://images.meesho.com/images/products/973837279/l2b4k.jpg?width=1024":
    "/products/coord-035/product-35-main.jpg",
  "https://images.meesho.com/images/products/973837279/xdmcg.jpg?width=1024":
    "/products/coord-035/product-35-2.jpg",
  "https://images.meesho.com/images/products/973837279/islus.jpg?width=1024":
    "/products/coord-035/product-35-3.jpg",
  "https://images.meesho.com/images/products/973837279/1ekum.jpg?width=1024":
    "/products/coord-035/product-35-4.jpg",

  // Product 36 (4 listing photos)
  "https://images.meesho.com/images/products/1153459762/g4kd1.jpg?width=1024":
    "/products/top-036/product-36-main.jpg",
  "https://images.meesho.com/images/products/1153459762/bprn0.jpg?width=1024":
    "/products/top-036/product-36-2.jpg",
  "https://images.meesho.com/images/products/1153459762/osf8l.jpg?width=1024":
    "/products/top-036/product-36-3.jpg",
  "https://images.meesho.com/images/products/1153459762/omnsz.jpg?width=1024":
    "/products/top-036/product-36-4.jpg",

  // Product 37 (4 listing photos)
  "https://images.meesho.com/images/products/447557329/hliuy.jpg?width=1024":
    "/products/top-037/product-37-main.jpg",
  "https://images.meesho.com/images/products/447557329/rotoh.jpg?width=1024":
    "/products/top-037/product-37-2.jpg",
  "https://images.meesho.com/images/products/447557329/eryrp.jpg?width=1024":
    "/products/top-037/product-37-3.jpg",
  "https://images.meesho.com/images/products/447557329/qurgt.jpg?width=1024":
    "/products/top-037/product-37-4.jpg",

  // Product 38 (4 listing photos)
  "https://images.meesho.com/images/products/480179648/fhsvn.jpg?width=1024":
    "/products/kurti-038/product-38-main.jpg",
  "https://images.meesho.com/images/products/480179648/tfitb.jpg?width=1024":
    "/products/kurti-038/product-38-2.jpg",
  "https://images.meesho.com/images/products/480179648/yrhqn.jpg?width=1024":
    "/products/kurti-038/product-38-3.jpg",
  "https://images.meesho.com/images/products/480179648/tpilw.jpg?width=1024":
    "/products/kurti-038/product-38-4.jpg",

  // Product 39 (3 listing photos)
  "https://images.meesho.com/images/products/964489194/xeqjw.jpg?width=1024":
    "/products/kurti-039/product-39-main.jpg",
  "https://images.meesho.com/images/products/964489194/12yot.jpg?width=1024":
    "/products/kurti-039/product-39-2.jpg",
  "https://images.meesho.com/images/products/964489194/iuclu.jpg?width=1024":
    "/products/kurti-039/product-39-3.jpg",
};

/** Prefer the locally hosted, web-sized copy; fall back to the Meesho CDN. */
export function getPreferredImageSrc(src: string): string {
  return LOCAL_MIRROR_MAP[src] || src;
}

export const ImageWithFallback: React.FC<ImageWithFallbackProps> = ({
  src,
  alt,
  fallbackText,
  aspectRatioClass = "aspect-[3/4]",
  containerClassName = "",
  className = "",
  ...props
}) => {
  const preferred = getPreferredImageSrc(src);
  const [currentSrc, setCurrentSrc] = useState(preferred);
  const [triedRemote, setTriedRemote] = useState(preferred === src);
  const [failed, setFailed] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setCurrentSrc(preferred);
    setTriedRemote(preferred === src);
    setFailed(false);
    setLoaded(false);
  }, [src, preferred]);

  const handleError = () => {
    if (!triedRemote) {
      setTriedRemote(true);
      setCurrentSrc(src);
    } else {
      setFailed(true);
    }
  };

  return (
    <div
      className={`relative overflow-hidden bg-[#E8E2D8] ${aspectRatioClass} ${containerClassName}`}
    >
      {/* Subtle Loading Shimmer while downloading real photo */}
      {!loaded && !failed && (
        <div className="absolute inset-0 bg-[#E8E2D8] animate-pulse" />
      )}

      {!failed ? (
        <img
          src={currentSrc}
          alt={alt}
          referrerPolicy="no-referrer"
          loading="lazy"
          onLoad={() => setLoaded(true)}
          onError={handleError}
          className={`w-full h-full object-cover object-top transition-all duration-500 ${
            loaded ? "opacity-100" : "opacity-0"
          } ${className}`}
          {...props}
        />
      ) : (
        /* Neutral Broken State (No fake AI images, no placeholder labels) */
        <div className="absolute inset-0 flex flex-col items-center justify-center p-4 bg-[#F5F1E8] text-[#5F564A]">
          <span className="text-xs font-editorial text-[#17130E]">{fallbackText || alt}</span>
          <span className="text-[10px] text-[#5F564A] mt-1">Photo unavailable</span>
        </div>
      )}
    </div>
  );
};
