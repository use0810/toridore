type Props = {
 isAvailable: boolean;
 onToggle: (checked: boolean) => void;
};

export default function MenuAvailabilityToggle({ isAvailable, onToggle }: Props) {
 return (
   <div>
     <label className="inline-flex items-center gap-2">
       <input
         type="checkbox"
         checked={isAvailable}
         onChange={(e) => onToggle(e.target.checked)}
       />
       公開する（販売中）
     </label>
   </div>
 );
}
