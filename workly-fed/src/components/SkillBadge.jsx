export default function ({ ...props }) {
  const badgeColors = [
    "bg-blue-200 text-blue-800",
    "bg-green-200 text-green-800",
    "bg-yellow-200 text-yellow-800",
    "bg-purple-200 text-purple-800",
    "bg-pink-200 text-pink-800",
    "bg-red-200 text-red-800",
    "bg-indigo-200 text-indigo-800",
    "bg-teal-200 text-teal-800",
    "bg-orange-200 text-orange-800",
  ];

  const skills = props.skills ? props.skills.split(" | ") : [];

  return (
    <div className="flex flex-wrap gap-2 items-center">
      {skills.map((skill, index) =>
        skill === "+" ? null : (
          <span
            key={index}
            className={`rounded-xl px-3 py-1 text-sm font-semibold whitespace-nowrap ${
              badgeColors[index % badgeColors.length]
            }`}
          >
            {skill}
          </span>
        )
      )}
    </div>
  );
}
