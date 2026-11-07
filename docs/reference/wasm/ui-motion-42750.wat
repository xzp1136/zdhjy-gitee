  (func (;42750;) (type 1) (param i32 i32)
    (local i32 i32 i32 i32 i32)
    i32.const 4366197
    i32.load8_u
    i32.eqz
    if  ;; label = @1
      i32.const 3345732
      call 2180
      i32.const 3345604
      call 2180
      i32.const 3354340
      call 2180
      i32.const 3409240
      call 2180
      i32.const 3409244
      call 2180
      i32.const 3360788
      call 2180
      i32.const 3419860
      call 2180
      i32.const 3480588
      call 2180
      i32.const 4366197
      i32.const 1
      i32.store8
    end
    local.get 0
    i32.load offset=88
    local.set 1
    i32.const 3360788
    i32.load
    local.tee 2
    i32.load offset=116
    i32.eqz
    if  ;; label = @1
      local.get 2
      call 60460
    end
    block  ;; label = @1
      local.get 1
      i32.const 0
      i32.const 0
      call 48812
      i32.eqz
      br_if 0 (;@1;)
      i32.const 0
      call 56067
      local.set 2
      local.get 0
      i32.load offset=88
      local.set 1
      block  ;; label = @2
        local.get 2
        i32.load offset=152
        i32.const 0
        i32.gt_s
        if  ;; label = @3
          local.get 1
          i32.const 0
          call 56067
          i32.load offset=152
          i32.const 0
          call 43845
          local.get 1
          i32.load
          local.tee 2
          i32.load offset=796
          local.get 2
          i32.load offset=792
          call_indirect (type 2)
          local.get 0
          i32.load offset=124
          local.tee 1
          i32.eqz
          br_if 1 (;@2;)
          local.get 1
          i32.const 0
          i32.const 0
          call 43174
          br 1 (;@2;)
        end
        local.get 1
        i32.const 3480588
        i32.load
        local.get 1
        i32.load
        local.tee 2
        i32.load offset=796
        local.get 2
        i32.load offset=792
        call_indirect (type 2)
        local.get 0
        i32.load offset=124
        local.tee 1
        i32.eqz
        br_if 0 (;@2;)
        local.get 1
        i32.const 1
        i32.const 0
        call 43174
      end
      i32.const 4367038
      i32.load8_u
      i32.eqz
      if  ;; label = @2
        i32.const 3363928
        call 2180
        i32.const 4367038
        i32.const 1
        i32.store8
      end
      i32.const 3363928
      i32.load
      i32.load offset=92
      i32.load
      local.tee 1
      i32.eqz
      br_if 0 (;@1;)
      i32.const 0
      call 56067
      i32.load offset=404
      local.set 2
      i32.const 0
      call 56067
      i32.load offset=152
      local.set 4
      i32.const 3345604
      i32.load
      call 1900
      local.tee 5
      local.get 0
      i32.const 3409240
      i32.load
      i32.const 0
      call 44658
      i32.const 4367038
      i32.load8_u
      i32.eqz
      if  ;; label = @2
        i32.const 3363928
        call 2180
        i32.const 4367038
        i32.const 1
        i32.store8
      end
      i32.const 3363928
      i32.load
      i32.load offset=92
      i32.load
      local.set 3
      i32.const 3345732
      i32.load
      call 1900
      local.tee 6
      local.get 3
      i32.const 3419860
      i32.load
      i32.const 0
      call 44658
      i32.const 3354340
      i32.load
      call 1900
      local.tee 3
      local.get 0
      i32.const 3409244
      i32.load
      i32.const 0
      call 38015
      local.get 1
      local.get 2
      local.get 4
      f32.convert_i32_s
      local.get 5
      local.get 6
      local.get 3
      i32.const 1
      i32.const 0
      call 43763
    end)
