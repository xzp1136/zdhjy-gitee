  (func (;43176;) (type 1) (param i32 i32)
    (local i32)
    i32.const 4366538
    i32.load8_u
    i32.eqz
    if  ;; label = @1
      i32.const 3354340
      call 2180
      i32.const 3420728
      call 2180
      i32.const 4366538
      i32.const 1
      i32.store8
    end
    block  ;; label = @1
      local.get 0
      i32.load8_u offset=24
      br_if 0 (;@1;)
      local.get 0
      i32.load8_u offset=25
      i32.eqz
      br_if 0 (;@1;)
      local.get 0
      i32.load offset=20
      local.set 1
      i32.const 3354340
      i32.load
      call 1900
      local.tee 2
      local.get 0
      i32.const 3420728
      i32.load
      i32.const 0
      call 38015
      local.get 0
      local.get 0
      local.get 1
      f32.convert_i32_s
      local.get 2
      i32.const 0
      i32.const 0
      call 43909
      i32.store offset=28
    end)
