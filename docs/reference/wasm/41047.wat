  (func (;41047;) (type 2) (param i32 i32 i32)
    block  ;; label = @1
      local.get 1
      i32.eqz
      br_if 0 (;@1;)
      local.get 1
      i32.load offset=28
      i32.eqz
      br_if 0 (;@1;)
      local.get 1
      i32.load8_u offset=33
      br_if 0 (;@1;)
      local.get 1
      i32.const 1
      i32.store8 offset=33
      i32.const 4365145
      i32.load8_u
      i32.eqz
      if  ;; label = @2
        i32.const 3367932
        call 2180
        i32.const 4365145
        i32.const 1
        i32.store8
      end
      i32.const 3367932
      i32.load
      call 1900
      local.tee 2
      local.get 0
      i32.store offset=20
      local.get 2
      i32.const 0
      i32.store offset=8
      local.get 2
      local.get 1
      i32.store offset=16
      local.get 0
      local.get 2
      i32.const 0
      call 48887
      drop
    end)
