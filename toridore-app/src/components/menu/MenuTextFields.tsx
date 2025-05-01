type Props = {
 name: string;
 price: number;
 description: string;
 onChangeName: (v: string) => void;
 onChangePrice: (v: number) => void;
 onChangeDescription: (v: string) => void;
};

export default function MenuTextFields({
 name,
 price,
 description,
 onChangeName,
 onChangePrice,
 onChangeDescription,
}: Props) {
 return (
   <>
     <div>
       <label className="block font-medium">商品名</label>
       <input
         type="text"
         value={name}
         onChange={(e) => onChangeName(e.target.value)}
         required
         className="w-full border rounded p-2"
       />
     </div>

     <div>
       <label className="block font-medium">価格</label>
       <input
         type="number"
         value={price}
         onChange={(e) => onChangePrice(parseInt(e.target.value))}
         required
         className="w-full border rounded p-2"
       />
     </div>

     <div>
       <label className="block font-medium">説明（任意）</label>
       <textarea
         value={description}
         onChange={(e) => onChangeDescription(e.target.value)}
         className="w-full border rounded p-2"
       />
     </div>
   </>
 );
}
